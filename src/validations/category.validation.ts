import { z } from 'zod';

export const createCategorySchema = z.object({
    name: z.string({
        message: "Vui lòng nhập tên danh mục"
    }).min(2, "Tên danh mục phải có ít nhất 2 ký tự").max(50, "Tên danh mục không được vượt quá 50 ký tự"),

    parentId: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    sortOrder: z.number().optional().default(0),
    isActive: z.boolean().optional().default(true)
});

export const updateCategorySchema = z.object({
    name: z.string({
        message: "Vui lòng nhập tên danh mục"
    }).min(2, "Tên danh mục phải có ít nhất 2 ký tự").max(50, "Tên danh mục không được vượt quá 50 ký tự").optional(),

    parentId: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    sortOrder: z.number().optional(),
    isActive: z.boolean().optional()
});