import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { getProfile } from '../services/AuthService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { updateProfile } from '../services/AuthService';

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
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
};
export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
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
}

export const getUsersAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
        }
    });
    res.json({ success: true, data: users });
};

export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const { isActive } = req.body;

    const user = await prisma.user.update({
        where: { id },
        data: { isActive }
    });

    res.json({ success: true, message: 'Cập nhật trạng thái thành công', data: user });
};