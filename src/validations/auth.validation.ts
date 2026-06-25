import { z } from 'zod';

// Định nghĩa khuôn mẫu (schema) cho dữ liệu truyền lên khi Đăng ký
export const registerSchema = z.object({
    name: z.string({
        message: "Vui lòng nhập họ tên"
    }).min(2, "Họ tên phải có ít nhất 2 ký tự").max(50, "Họ tên không được vượt quá 50 ký tự"),

    email: z.string({
        message: "Vui lòng nhập email"
    }).email("Định dạng email không hợp lệ"),

    password: z.string({
        message: "Vui lòng nhập mật khẩu"
    }).min(6, "Mật khẩu phải có ít nhất 6 ký tự"),

    // Số điện thoại không bắt buộc, nhưng nếu nhập thì phải là 10 số
    phone: z.string().length(10, "Số điện thoại phải có đúng 10 số").optional(),
});

// Bạn có thể viết luôn schema cho Login ở đây
export const loginSchema = z.object({
    email: z.string({
        message: "Vui lòng nhập email"
    }).email("Định dạng email không hợp lệ"),

    password: z.string({
        message: "Vui lòng nhập mật khẩu"
    }).min(1, "Vui lòng nhập mật khẩu")
});

export const updateProfileSchema = z.object({
    name: z.string({
        message: "Vui lòng nhập họ tên"
    }).min(2, "Họ tên phải có ít nhất 2 ký tự").max(50, "Họ tên không được vượt quá 50 ký tự"),

    email: z.string({
        message: "Vui lòng nhập email"
    }).email("Định dạng email không hợp lệ"),

    password: z.string({
        message: "Vui lòng nhập mật khẩu"
    }).min(6, "Mật khẩu phải có ít nhất 6 ký tự"),

    // Số điện thoại không bắt buộc, nhưng nếu nhập thì phải là 10 số
    phone: z.string().length(10, "Số điện thoại phải có đúng 10 số").optional(),
});