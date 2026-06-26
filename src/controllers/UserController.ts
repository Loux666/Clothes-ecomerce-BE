import { Request, Response } from 'express';
import { getProfile } from '../services/AuthService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { updateProfile } from '../services/AuthService';

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const result = await getProfile(String(userId));

        res.json({
            message: 'Lấy thông tin người dùng thành công',
            data: {
                user: result.id,
                email: result.email,
                name: result.name,
                phone: result.phone,
                role: result.role
            }
        });
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};
export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const { name, email, password, phone, role } = req.body;

        const user = await updateProfile(String(userId), {
            name: name,
            email: email,
            password: password,
            phone: phone,
            role: role
        });

        res.status(200).json({
            message: 'Cập nhật thông tin người dùng thành công',
            data: user
        });


    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }



}