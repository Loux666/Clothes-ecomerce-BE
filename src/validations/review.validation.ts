import { z } from 'zod';

export const createReviewSchema = z.object({
    body: z.object({
        productId: z.string({ message: "Thiếu productId" }),
        orderItemId: z.string({ message: "Thiếu orderItemId" }),
        rating: z.number().min(1, "Ít nhất 1 sao").max(5, "Tối đa 5 sao"),
        comment: z.string().optional(),
        images: z.array(z.string()).optional()
    })
});

export const updateReviewStatusSchema = z.object({
    body: z.object({
        status: z.enum(['PENDING', 'APPROVED', 'REJECTED'])
    })
});
