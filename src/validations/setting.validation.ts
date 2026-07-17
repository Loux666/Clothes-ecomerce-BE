import { z } from 'zod';

export const updateSettingSchema = z.object({
    body: z.object({
        value: z.any() // Có thể là mảng hoặc object
    })
});
