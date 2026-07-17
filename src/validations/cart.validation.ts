import { z } from 'zod';


export const getCartItemsValidation = z.object({
    body: z.object({
        cartId: z.string().uuid(),
    })
});

export const addToCartValidation = z.object({
    body: z.object({
        variantId: z.string().uuid(),
        quantity: z.number().int().positive(),
    })
});

export const updateCartValidation = z.object({
    body: z.object({
        quantity: z.number().int().positive({ message: "Số lượng phải lớn hơn 0" }),
    })
});

