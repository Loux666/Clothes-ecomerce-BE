import { z } from 'zod';

export const createCouponSchema = z.object({
    body: z.object({
        code: z.string({ message: "Mã giảm giá là bắt buộc" })
            .min(3, "Mã giảm giá phải có ít nhất 3 ký tự")
            .toUpperCase(),
        type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING'], {
            message: "Loại giảm giá không hợp lệ"
        }),
        value: z.number({ message: "Giá trị giảm là bắt buộc" })
            .positive("Giá trị giảm phải lớn hơn 0"),
        minOrderValue: z.number().min(0).nullable().optional().default(null),
        maxDiscount: z.number().positive().nullable().optional().default(null),
        usageLimit: z.number().int().positive().nullable().optional().default(null),
        startDate: z.union([z.string().datetime({ message: "Ngày bắt đầu không hợp lệ" }), z.null()]).optional(),
        endDate: z.union([z.string().datetime({ message: "Ngày kết thúc không hợp lệ" }), z.null()]).optional(),
        isActive: z.boolean().optional().default(true)
    }).refine((data) => {
        if (data.type === 'PERCENTAGE' && data.value > 100) {
            return false;
        }
        return true;
    }, {
        message: "Giá trị giảm phần trăm không được vượt quá 100%",
        path: ["value"]
    }).refine((data) => {
        if (data.startDate && data.endDate) {
            return new Date(data.startDate) < new Date(data.endDate);
        }
        return true;
    }, {
        message: "Ngày kết thúc phải lớn hơn ngày bắt đầu",
        path: ["endDate"]
    })
});

export const updateCouponSchema = z.object({
    body: z.object({
        code: z.string().min(3).toUpperCase().optional(),
        type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']).optional(),
        value: z.number().positive().optional(),
        minOrderValue: z.number().min(0).nullable().optional(),
        maxDiscount: z.number().positive().nullable().optional(),
        usageLimit: z.number().int().positive().nullable().optional(),
        startDate: z.union([z.string().datetime(), z.null()]).optional(),
        endDate: z.union([z.string().datetime(), z.null()]).optional(),
        isActive: z.boolean().optional()
    }).refine((data) => {
        if (data.type === 'PERCENTAGE' && data.value && data.value > 100) {
            return false;
        }
        return true;
    }, {
        message: "Giá trị giảm phần trăm không được vượt quá 100%",
        path: ["value"]
    }).refine((data) => {
        if (data.startDate && data.endDate) {
            return new Date(data.startDate) < new Date(data.endDate);
        }
        return true;
    }, {
        message: "Ngày kết thúc phải lớn hơn ngày bắt đầu",
        path: ["endDate"]
    })
});

// Schema dùng cho Frontend check mã hợp lệ (POST /api/coupons/validate)
export const validateCouponSchema = z.object({
    body: z.object({
        code: z.string({ message: "Vui lòng nhập mã giảm giá" }),
        orderValue: z.number({ message: "Giá trị đơn hàng là bắt buộc" }).min(0)
    })
});
