import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export const createCoupon = async (data: Prisma.CouponCreateInput) => {
    // Kiểm tra mã đã tồn tại chưa
    const existing = await prisma.coupon.findUnique({
        where: { code: data.code }
    });
    if (existing) {
        throw new Error("Mã giảm giá này đã tồn tại!");
    }

    return await prisma.coupon.create({ data });
};

export const getCoupons = async (page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;
    const [coupons, total] = await Promise.all([
        prisma.coupon.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.coupon.count()
    ]);

    return {
        data: coupons,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

export const updateCoupon = async (id: string, data: Prisma.CouponUpdateInput) => {
    // Nếu có update code, check xem code mới có bị trùng không
    if (data.code) {
        const existing = await prisma.coupon.findFirst({
            where: {
                code: data.code as string,
                id: { not: id } // Loại trừ chính nó
            }
        });
        if (existing) {
            throw new Error("Mã giảm giá này đã tồn tại!");
        }
    }

    return await prisma.coupon.update({
        where: { id },
        data
    });
};

export const deleteCoupon = async (id: string) => {
    return await prisma.coupon.delete({
        where: { id }
    });
};

// Validate Coupon dùng cho Frontend khi chuẩn bị Checkout
export const validateCoupon = async (code: string, orderValue: number) => {
    const coupon = await prisma.coupon.findUnique({
        where: { code }
    });

    if (!coupon) {
        throw new Error("Mã giảm giá không tồn tại!");
    }

    if (!coupon.isActive) {
        throw new Error("Mã giảm giá đã bị khóa hoặc ngừng áp dụng!");
    }

    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
        throw new Error("Mã giảm giá chưa đến ngày bắt đầu sử dụng!");
    }

    if (coupon.endDate && now > coupon.endDate) {
        throw new Error("Mã giảm giá đã hết hạn sử dụng!");
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        throw new Error("Mã giảm giá đã hết lượt sử dụng!");
    }

    if (coupon.minOrderValue && new Prisma.Decimal(orderValue).lessThan(coupon.minOrderValue)) {
        throw new Error(`Đơn hàng tối thiểu để áp dụng mã này là ${coupon.minOrderValue}đ!`);
    }

    // Tính toán số tiền được giảm
    let discountAmount = 0;
    const orderValueDecimal = new Prisma.Decimal(orderValue);

    if (coupon.type === 'PERCENTAGE') {
        const discount = orderValueDecimal.mul(coupon.value).div(100);
        // Nếu có giới hạn giảm tối đa
        if (coupon.maxDiscount && discount.greaterThan(coupon.maxDiscount)) {
            discountAmount = Number(coupon.maxDiscount);
        } else {
            discountAmount = Number(discount);
        }
    } else if (coupon.type === 'FIXED_AMOUNT') {
        discountAmount = Number(coupon.value);
        // Không thể giảm nhiều hơn giá trị đơn hàng
        if (discountAmount > orderValue) {
            discountAmount = orderValue;
        }
    } else if (coupon.type === 'FREE_SHIPPING') {
        // FREE_SHIPPING sẽ được xử lý riêng lúc checkout tùy thuộc phí ship, tạm thời return discountAmount = 0
        // Frontend sẽ nhận diện type và áp free_shipping 
        discountAmount = 0; 
    }

    return {
        valid: true,
        couponId: coupon.id,
        type: coupon.type,
        discountAmount: discountAmount,
        coupon: coupon
    };
};
