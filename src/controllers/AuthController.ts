import { Request, Response } from 'express';
import { loginUser } from '../services/AuthService';
import { registerUser } from '../services/AuthService';
import { verifyOtpService } from '../services/AuthService';


export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Gọi Service để xử lý logic
        const result = await loginUser(email, password);

        // Trả kết quả thành công cho Frontend
        res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: false, // dev = false, production = true
            sameSite: 'lax',
            maxAge: 30 * 60 * 1000 // han 30 phut
        });
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: false, // dev = false, production = true
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // han 7 ngay
        });
        res.json({
            message: 'Đăng nhập thành công',
            data: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                phone: result.user.phone,
                role: result.user.role,
                accessToken: result.accessToken,
                // refreshToken: result.refreshToken
            }
        });
    } catch (error: any) {
        // Bắt lỗi từ Service
        res.status(error.status || 401).json({ message: error.message });
    }
};

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        // Gọi Service để xử lý logic
        const result = await registerUser(data);

        // Trả kết quả thành công cho Frontend
        res.json({
            message: 'Đăng ký thành công',
            data: result.data,
        });
    } catch (error: any) {
        // Bắt lỗi từ Service (Email đã tồn tại, lỗi DB...)
        res.status(400).json({ message: error.message });
    }
}

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.json({
            message: 'Đăng xuất thành công',
        });
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};



export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp_code } = req.body;

        if (!email || !otp_code) {
            res.status(400).json({ message: 'Thiếu email hoặc mã OTP' });
            return;
        }

        const result = await verifyOtpService(email, otp_code);

        res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 30 * 60 * 1000
        });
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: 'Xác thực OTP thành công',
            data: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                role: result.user.role,
                accessToken: result.accessToken,
            }
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};