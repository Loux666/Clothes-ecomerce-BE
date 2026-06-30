import { z } from 'zod';

export const checkoutSchema = z.object({
    body: z.object({
        shippingName: z.string({ message: "Tên người nhận là bắt buộc" }).min(2, "Tên quá ngắn"),
        shippingPhone: z.string({ message: "Số điện thoại là bắt buộc" })
            .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không hợp lệ"),
        shippingAddress: z.string({ message: "Địa chỉ nhận hàng là bắt buộc" }).min(5, "Địa chỉ quá ngắn"),
        shippingProvince: z.string({ message: "Tỉnh/Thành phố là bắt buộc" }),
        paymentMethod: z.enum(['COD', 'VNPAY', 'MOMO'], { message: "Phương thức thanh toán không hợp lệ" }),
        note: z.string().optional(),
        couponId: z.string().optional(),
        items: z.array(
            z.object({
                variantId: z.string({ message: "variantId là bắt buộc" }),
                quantity: z.number({ message: "quantity là bắt buộc" }).int().positive("Số lượng phải lớn hơn 0")
            })
        ).min(1, "Giỏ hàng không được để trống")
    })
});

export const updateOrderStatusSchema = z.object({
    body: z.object({
        status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'], {
            message: "Trạng thái đơn hàng không hợp lệ"
        }),
        note: z.string().optional()
    })
});

export const cancelOrderSchema = z.object({
    body: z.object({
        reason: z.string({ message: "Lý do hủy đơn là bắt buộc" }).min(5, "Vui lòng nhập lý do rõ ràng hơn")
    })
});
