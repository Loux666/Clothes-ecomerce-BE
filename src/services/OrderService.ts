import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError';

// Tạo mã đơn hàng dạng ORD-YYYYMMDD-XXXX
const generateOrderCode = () => {
    const date = new Date();
    const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${dateString}-${random}`;
};

export const checkout = async (userId: string | null | undefined, data: any) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Sắp xếp mảng ID để tránh deadlock
        const variantIds = data.items.map((item: any) => item.variantId).sort();

        if (variantIds.length === 0) throw new ApiError(400, "Giỏ hàng đang trống!");

        // 2. Lock Row các variant (chống Oversell khi nhiều luồng mua cùng 1 lúc)
        const inClause = variantIds.map((id: string) => `'${id}'`).join(',');
        await tx.$executeRawUnsafe(`SELECT id FROM product_variants WHERE id IN (${inClause}) FOR UPDATE`);

        // 3. Query thông tin chi tiết các variants từ DB
        const variants = await tx.productVariant.findMany({
            where: { id: { in: variantIds } },
            include: {
                product: {
                    include: {
                        images: { where: { isPrimary: true }, take: 1 }
                    }
                },
                attributes: {
                    include: {
                        attributeValue: { include: { attribute: true } }
                    }
                }
            }
        });

        let subtotal = new Prisma.Decimal(0);
        const orderItemsData: any[] = [];

        // 4. Kiểm tra số lượng tồn kho từng mặt hàng & Tính subtotal
        for (const item of data.items) {
            const variant = variants.find(v => v.id === item.variantId);
            if (!variant) throw new ApiError(404, "Sản phẩm không tồn tại!");
            
            if (variant.stockQty < item.quantity) {
                throw new ApiError(400, `Sản phẩm ${variant.product.name} (Phân loại: ${variant.sku}) chỉ còn ${variant.stockQty} trong kho!`);
            }

            const price = variant.priceOverride || variant.product.basePrice;
            const itemSubtotal = new Prisma.Decimal(price).mul(item.quantity);
            subtotal = subtotal.add(itemSubtotal);

            // Ghi lại biến thể (vd: Màu: Đỏ, Size: M) để lưu snapshot
            const variantInfo = variant.attributes.reduce((acc: any, attr) => {
                acc[attr.attributeValue.attribute.name] = attr.attributeValue.value;
                return acc;
            }, {});

            orderItemsData.push({
                variantId: variant.id,
                productName: variant.product.name,
                variantInfo: variantInfo,
                sku: variant.sku,
                imageUrl: variant.product.images[0]?.url || null,
                unitPrice: price,
                quantity: item.quantity,
                subtotal: itemSubtotal
            });
        }

        // 5. Xử lý Mã giảm giá (Coupon)
        let discountAmount = new Prisma.Decimal(0);
        let validCouponId = null;

        if (data.couponId) {
            const coupon = await tx.coupon.findUnique({ where: { id: data.couponId } });

            if (!coupon) throw new ApiError(404, "Mã giảm giá không tồn tại!");
            if (!coupon.isActive) throw new ApiError(400, "Mã giảm giá đã bị khóa!");
            
            const now = new Date();
            if (coupon.startDate && now < coupon.startDate) throw new ApiError(400, "Mã giảm giá chưa đến ngày bắt đầu sử dụng!");
            if (coupon.endDate && now > coupon.endDate) throw new ApiError(400, "Mã giảm giá đã hết hạn!");
            if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) throw new ApiError(400, "Mã giảm giá đã hết lượt sử dụng!");
            if (coupon.minOrderValue && subtotal.lessThan(coupon.minOrderValue)) throw new ApiError(400, `Đơn tối thiểu để áp dụng mã này là ${coupon.minOrderValue}đ!`);

            // Tính tiền giảm
            if (coupon.type === 'PERCENTAGE') {
                const discount = subtotal.mul(coupon.value).div(100);
                if (coupon.maxDiscount && discount.greaterThan(coupon.maxDiscount)) {
                    discountAmount = coupon.maxDiscount;
                } else {
                    discountAmount = discount;
                }
            } else if (coupon.type === 'FIXED_AMOUNT') {
                discountAmount = coupon.value;
                if (discountAmount.greaterThan(subtotal)) discountAmount = subtotal; // Không giảm quá tổng tiền
            } // FREE_SHIPPING tạm tính bằng 0 vì shippingFee đang là 0

            validCouponId = coupon.id;

            // Tăng số lượt dùng của Coupon lên 1
            await tx.coupon.update({
                where: { id: coupon.id },
                data: { usedCount: { increment: 1 } }
            });
        }

        // 6. Tính tổng tiền thanh toán cuối cùng
        const shippingFee = new Prisma.Decimal(data.shippingFee || 0);
        const totalAmount = subtotal.add(shippingFee).sub(discountAmount);

        // 7. Tạo Order và các OrderItem cùng 1 lúc
        const orderCode = generateOrderCode();
        const order = await tx.order.create({
            data: {
                orderCode,
                userId: userId || null,
                shippingName: data.shippingName,
                shippingPhone: data.shippingPhone,
                shippingAddress: data.shippingAddress,
                shippingProvince: data.shippingProvince,
                subtotal,
                shippingFee,
                discountAmount,
                totalAmount,
                paymentMethod: data.paymentMethod,
                note: data.note || null,
                couponId: validCouponId,
                items: {
                    create: orderItemsData
                }
            },
            include: { items: true }
        });

        // 8. Trừ tồn kho và lưu Lịch sử (InventoryLog)
        for (const item of data.items) {
            // Trừ kho
            await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stockQty: { decrement: item.quantity } }
            });

            // Lưu lịch sử
            await tx.inventoryLog.create({
                data: {
                    variantId: item.variantId,
                    changeQty: -item.quantity,
                    reason: 'ORDER',
                    referenceId: order.id,
                    note: `Xuất kho do đơn hàng ${order.orderCode}`
                }
            });
        }

        // 9. Lưu CouponUsage nếu User có đăng nhập và dùng mã
        if (validCouponId && userId) {
            await tx.couponUsage.create({
                data: {
                    couponId: validCouponId,
                    userId: userId,
                    orderId: order.id
                }
            });
        }

        // 10. Dọn dẹp giỏ hàng của User (Xóa những item vừa mua thành công)
        if (userId) {
            // Chú ý: cartItem nối với Giỏ Hàng của User thông qua cartId, ta có thể xóa dựa vào cart.userId
            const cart = await tx.cart.findUnique({ where: { userId } });
            if (cart) {
                await tx.cartItem.deleteMany({
                    where: {
                        cartId: cart.id,
                        variantId: { in: variantIds }
                    }
                });
            }
        }

        return order;
    });
};

export const checkPaymentStatus = async (orderCode: string) => {
    const order = await prisma.order.findUnique({
        where: { orderCode },
        select: { paymentStatus: true, status: true }
    });
    if (!order) throw new ApiError(404, "Đơn hàng không tồn tại");
    return order;
};

export const getMyOrders = async (userId: string) => {
    return await prisma.order.findMany({
        where: { userId },
        include: { items: true },
        orderBy: { createdAt: 'desc' }
    });
};

export const getMyOrderDetails = async (userId: string, orderId: string) => {
    const order = await prisma.order.findFirst({
        where: { id: orderId, userId },
        include: { items: true }
    });
    if (!order) throw new ApiError(404, "Đơn hàng không tồn tại hoặc không thuộc về bạn");
    return order;
};

export const getAllOrdersAdmin = async (page: number, limit: number, status?: string) => {
    const skip = (page - 1) * limit;
    const whereCondition = status ? { status: status as any } : {};

    const [data, total] = await Promise.all([
        prisma.order.findMany({
            where: whereCondition,
            skip,
            take: limit,
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.order.count({ where: whereCondition })
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getOrderDetailsAdmin = async (orderId: string) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
    });
    if (!order) throw new ApiError(404, "Đơn hàng không tồn tại");
    return order;
};

export const updateOrderStatus = async (orderId: string, status: string, note?: string) => {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new ApiError(404, "Đơn hàng không tồn tại");

    return await prisma.order.update({
        where: { id: orderId },
        data: { 
            status: status as any, 
            note: note || order.note 
        }
    });
};

export const cancelOrder = async (orderId: string, reason: string, userId?: string | null) => {
    return await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({ 
            where: { id: orderId },
            include: { items: true }
        });

        if (!order) throw new ApiError(404, "Đơn hàng không tồn tại");
        
        // Chặn hoàn toàn các case vô lý chung cho cả Admin và User
        if (order.status === 'CANCELLED') throw new ApiError(409, "Đơn hàng này đã bị hủy trước đó rồi");
        if (order.status === 'DELIVERED') throw new ApiError(400, "Không thể hủy đơn hàng đã giao thành công");

        if (userId) {
            // Logic dành cho Khách hàng (User) tự hủy
            if (order.userId !== userId) {
                throw new ApiError(403, "Bạn không có quyền hủy đơn hàng này");
            }
            if (order.status !== 'PENDING') {
                throw new ApiError(400, "Khách hàng chỉ có thể tự hủy khi đơn hàng đang ở trạng thái chờ xác nhận (PENDING). Vui lòng liên hệ CSKH.");
            }
        } else {
            // Logic dành cho Admin hủy
            // Admin có thể hủy ở PENDING, CONFIRMED, PROCESSING, SHIPPED (Đã check CANCELLED và DELIVERED ở trên)
        }

        // Hoàn lại kho
        for (const item of order.items) {
            if (!item.variantId) continue; // Bỏ qua nếu variant đã bị xóa khỏi DB

            await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stockQty: { increment: item.quantity } }
            });

            await tx.inventoryLog.create({
                data: {
                    variantId: item.variantId,
                    changeQty: item.quantity,
                    reason: 'RETURN',
                    referenceId: order.id,
                    note: `Hoàn kho do hủy đơn hàng ${order.orderCode}. Lý do: ${reason}`
                }
            });
        }

        return await tx.order.update({
            where: { id: orderId },
            data: { 
                status: 'CANCELLED',
                note: `Đã hủy: ${reason}`
            }
        });
    });
};
