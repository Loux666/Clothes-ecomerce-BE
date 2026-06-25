import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Mở rộng kiểu dữ liệu của Request để có thể chứa thêm thông tin user
export interface AuthRequest extends Request {
    user?: any;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        // 1. Lấy token từ header 'Authorization'
        // const authHeader = req.headers['authorization'];

        // Header thường có dạng: "Bearer eyJhbGciOiJIUzI1..." nên ta cắt lấy phần sau chữ Bearer
        // const token = authHeader && authHeader.split(' ')[1];
        const token = req.cookies.accessToken;
        if (!token) {
            res.status(401).json({ message: 'Không tìm thấy Token. Vui lòng đăng nhập!' });
            return;
        }

        // 2. Kiểm tra Token có hợp lệ / hết hạn chưa
        const secretKey = process.env.ACCESS_SECRET || 'access token';
        const decoded = jwt.verify(token, secretKey);

        // 3. Nếu xịn, lưu thông tin user vào Request để các Controller phía sau có thể dùng
        req.user = decoded;

        // 4. Cho phép đi tiếp vào Controller
        next();
    } catch (error: any) {
        // Lỗi thường là: TokenExpiredError (hết hạn) hoặc JsonWebTokenError (sai token)
        res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn!', error: error.message });
    }
};

// Middleware phân quyền dựa trên mảng các role cho phép
export const authorizeRoles = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !req.user.role) {
            res.status(403).json({ message: 'Không thể xác thực quyền truy cập!' });
            return;
        }

        if (allowedRoles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này!' });
        }
    };
};
