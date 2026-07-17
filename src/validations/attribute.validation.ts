import { z } from "zod";

export const createAttributeSchema = z.object({
    body: z.object({
        name: z.string({
            message: "Vui lòng nhập tên thuộc tính"
        }).min(1, "Tên thuộc tính không được để trống").max(100, "Không được vượt quá 100 ký tự"),

        type: z.string({
            message: "Vui lòng nhập kiểu hiển thị (ví dụ: color, button, dropdown)"
        })
    })
});
export const updateAttributeSchema = z.object({
    body: createAttributeSchema.shape.body.partial()
});

export const createAttributeValueSchema = z.object({
    body: z.object({
        value: z.string({ message: "Vui lòng nhập giá trị thuộc tính" }).min(1, "Giá trị không được để trống").max(100, "Không được vượt quá 100 ký tự"),
        hexCode: z.string().max(7).optional().nullable(),
        sortOrder: z.number().optional().default(0)
    })
});

export const updateAttributeValueSchema = z.object({
    body: createAttributeValueSchema.shape.body.partial()
});

export type CreateAttributeType = z.infer<typeof createAttributeSchema>['body'];
export type UpdateAttributeType = z.infer<typeof updateAttributeSchema>['body'];
export type CreateAttributeValueType = z.infer<typeof createAttributeValueSchema>['body'];
export type UpdateAttributeValueType = z.infer<typeof updateAttributeValueSchema>['body'];