import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as orderService from '../services/OrderService';

export const checkout = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id; // Lấy từ middleware verifyToken (nếu có)
        const order = await orderService.checkout(userId, req.body);

        res.status(201).json({
            message: "Đặt hàng thành công",
            data: order
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
    // Để trống cho bước sau
};

export const getMyOrderDetails = async (req: AuthRequest, res: Response) => {
    // Để trống cho bước sau
};

export const getAllOrdersAdmin = async (req: AuthRequest, res: Response) => {
    // Để trống cho bước sau
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
    // Để trống cho bước sau
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
    // Để trống cho bước sau
};
