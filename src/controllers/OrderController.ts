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

export const checkPaymentStatus = async (req: Request, res: Response) => {
    try {
        const orderCode = req.params.orderCode as string;
        const statusData = await orderService.checkPaymentStatus(orderCode);
        res.status(200).json({ data: statusData });
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Vui lòng đăng nhập" });

        const orders = await orderService.getMyOrders(userId);
        res.status(200).json({ data: orders });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getMyOrderDetails = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Vui lòng đăng nhập" });

        const order = await orderService.getMyOrderDetails(userId, req.params.id as string);
        res.status(200).json({ data: order });
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};

export const getAllOrdersAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as string | undefined;
        
        const result = await orderService.getAllOrdersAdmin(page, limit, status);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};

export const getOrderDetailsAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const order = await orderService.getOrderDetailsAdmin(req.params.id as string);
        res.status(200).json({ data: order });
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { status, note } = req.body;
        const order = await orderService.updateOrderStatus(req.params.id as string, status, note);
        res.status(200).json({
            message: "Cập nhật trạng thái thành công",
            data: order
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { reason } = req.body;
        // Nếu là admin gọi thì bỏ qua check userId, nếu là user thì truyền userId
        const userId = req.user?.role === 'ADMIN' ? undefined : req.user?.id;
        
        const order = await orderService.cancelOrder(req.params.id as string, reason, userId);
        res.status(200).json({
            message: "Hủy đơn hàng thành công",
            data: order
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
