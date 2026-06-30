import { z } from 'zod';

export const addressSchema = z.object({
    body: z.object({
        fullName: z.string({ message: "Vui lòng nhập họ tên" }).min(2, "Họ tên quá ngắn"),
        phone: z.string({ message: "Vui lòng nhập số điện thoại" }).regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không hợp lệ"),
        province: z.string({ message: "Vui lòng nhập tỉnh/thành phố" }),
        district: z.string({ message: "Vui lòng nhập quận/huyện" }),
        ward: z.string({ message: "Vui lòng nhập phường/xã" }),
        street: z.string({ message: "Vui lòng nhập địa chỉ cụ thể" }),
        isDefault: z.boolean().optional().default(false)
    })
});
