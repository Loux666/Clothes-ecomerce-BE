import { z } from 'zod';

export const manualRestockSchema = z.object({
    body: z.object({
        variantId: z.string({ message: "Vui lòng cung cấp variantId" }).uuid("ID không hợp lệ"),
        quantity: z.number({ message: "Vui lòng nhập số lượng" }).int("Số lượng phải là số nguyên"),
        note: z.string({ message: "Vui lòng cung cấp lý do/ghi chú" }).min(5, "Ghi chú quá ngắn")
    })
});
