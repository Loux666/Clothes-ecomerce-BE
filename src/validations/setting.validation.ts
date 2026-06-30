import { z } from 'zod';

export const updateSettingSchema = z.object({
    body: z.object({
        value: z.string({ message: "Value là bắt buộc" }) // Sẽ lưu JSON
    })
});
