import { z } from 'zod';

export const toggleWishlistSchema = z.object({
    body: z.object({
        productId: z.string({ message: "Vui lòng cung cấp productId" }).uuid("ID không hợp lệ")
    })
});
