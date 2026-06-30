import { z } from 'zod';

export const updateSettingSchema = z.object({
    body: z.object({
        value: z.any({ required_error: "Value là bắt buộc" }) // Sẽ lưu JSON
    })
});
