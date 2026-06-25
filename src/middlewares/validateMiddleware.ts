import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Kiểm tra body theo schema được truyền vào
            await schema.parseAsync(req.body);
            next(); // Dữ liệu hợp lệ, cho phép đi tiếp vào Controller
        } catch (error) {
            if (error instanceof ZodError) {
                // Ép kiểu error để tránh lỗi TS của VS Code
                const validationError = error as ZodError;
                
                // Nếu có lỗi, map các lỗi ra cho đẹp (giống Laravel)
                const errors = validationError.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                res.status(422).json({
                    message: 'Dữ liệu không hợp lệ',
                    errors: errors,
                });
                return;
            }
            next(error); // Lỗi khác (không phải lỗi validate) thì quăng cho middleware bắt lỗi tổng
        }
    };
};
