import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

const inferStatusFromMessage = (message: string): number => {
    const normalized = message.toLowerCase();

    if (normalized.includes('không tìm thấy') || normalized.includes('không tồn tại') || normalized.includes('not found')) {
        return 404;
    }

    if (normalized.includes('không có quyền') || normalized.includes('vui lòng xác thực') || normalized.includes('chưa được xác thực')) {
        return 403;
    }

    if (normalized.includes('đã tồn tại') || normalized.includes('trùng') || normalized.includes('conflict')) {
        return 409;
    }

    if (normalized.includes('sai mật khẩu') || normalized.includes('otp') || normalized.includes('không hợp lệ') || normalized.includes('không chính xác')) {
        return 400;
    }

    if (normalized.includes('không thể') || normalized.includes('đã bị khóa') || normalized.includes('hết hạn') || normalized.includes('hết lượt')) {
        return 400;
    }

    return 500;
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
    next(new ApiError(404, `Không tìm thấy route: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
    if (res.headersSent) {
        next(err);
        return;
    }

    if (err instanceof ZodError) {
        res.status(422).json({
            message: 'Dữ liệu không hợp lệ',
            errors: err.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
                code: issue.code,
            })),
        });
        return;
    }

    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            message: err.message,
            code: err.code,
            details: err.details,
        });
        return;
    }

    const error = err instanceof Error ? err : new Error('Lỗi không xác định');
    const statusCode = inferStatusFromMessage(error.message);

    console.error('❌ API Error:', {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl,
        message: error.message,
        stack: error.stack,
    });

    res.status(statusCode).json({
        message: statusCode === 500 ? 'Đã có lỗi xảy ra ở server' : error.message,
    });
};