import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { PaymentMethod, PaymentGatewayStatus } from '@prisma/client';

export const sepayWebhook = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        // Xác thực token (Security)
        if (token !== process.env.SEPAY_API_TOKEN) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // Dữ liệu SePay gửi sang
        const {
            gateway,
            transactionDate,
            accountNumber,
            content,
            transferType,
            transferAmount,
            referenceCode
        } = req.body;

        // Chỉ quan tâm tiền VÀO (in)
        if (transferType !== 'in') {
            return res.status(200).json({ success: true, message: "Bỏ qua giao dịch tiền ra" });
        }

        // Tìm mã đơn hàng trong nội dung chuyển khoản (Ví dụ: ORD-20231012-1234 hoặc ORD202310121234)
        // Dùng Regex trích xuất chuỗi có định dạng ORD...
        const orderCodeMatch = content.match(/ORD[-_]?\d{8}[-_]?\d{4}/i);
        
        if (!orderCodeMatch) {
            return res.status(200).json({ success: true, message: "Không tìm thấy mã đơn hàng trong nội dung CK" });
        }

        // Lấy mã đơn hàng và chuẩn hóa lại đúng format DB: ORD-YYYYMMDD-XXXX
        let matchedCode = orderCodeMatch[0].toUpperCase().replace(/[-_]/g, '');
        // Chèn lại dấu gạch ngang
        if (matchedCode.length === 15) { // ORD + 8 số ngày + 4 số random = 15 ký tự
            matchedCode = `ORD-${matchedCode.substring(3, 11)}-${matchedCode.substring(11, 15)}`;
        }

        const order = await prisma.order.findUnique({
            where: { orderCode: matchedCode }
        });

        if (!order) {
            return res.status(200).json({ success: true, message: "Đơn hàng không tồn tại trong hệ thống" });
        }

        // Nếu đơn đã thanh toán rồi thì bỏ qua
        if (order.paymentStatus === 'PAID') {
            return res.status(200).json({ success: true, message: "Đơn hàng đã được thanh toán trước đó" });
        }

        // Kiểm tra số tiền gửi có đủ thanh toán đơn hàng không
        if (Number(transferAmount) < Number(order.totalAmount)) {
            // Thanh toán thiếu, có thể log lại hoặc xử lý tay
            return res.status(200).json({ success: true, message: "Khách chuyển thiếu tiền" });
        }

        // Thanh toán đủ (hoặc dư) => Cập nhật trạng thái đơn hàng
        await prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id: order.id },
                data: {
                    paymentStatus: 'PAID',
                    status: order.status === 'PENDING' ? 'CONFIRMED' : order.status // Tự động duyệt đơn nếu đang PENDING
                }
            });

            // Ghi nhận lịch sử thanh toán
            await tx.payment.create({
                data: {
                    orderId: order.id,
                    gateway: PaymentMethod.BANK_TRANSFER,
                    gatewayTxnId: referenceCode,
                    amount: transferAmount,
                    status: PaymentGatewayStatus.SUCCESS,
                    gatewayResponse: req.body,
                    paidAt: new Date(transactionDate || new Date())
                }
            });
        });

        return res.status(200).json({ success: true, message: "Thanh toán thành công" });
    } catch (error: any) {
        console.error("SePay Webhook Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
