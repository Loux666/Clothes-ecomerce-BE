import { z } from "zod";

export const createAttributeSchema = z.object({
    name: z.string({
        message: "Vui lòng nhập tên thuộc tính"
    }).min(1, "Tên thuộc tính không được để trống").max(100, "Không được vượt quá 100 ký tự"),

    type: z.string({
        message: "Vui lòng nhập kiểu hiển thị (ví dụ: color, button, dropdown)"
    })
});

export const updateAttributeSchema = createAttributeSchema.partial();