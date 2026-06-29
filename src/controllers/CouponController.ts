import { Request, Response } from 'express';
import * as couponService from '../services/CouponService';
import { AuthRequest } from '../middlewares/authMiddleware';

export const createCoupon = async (req: AuthRequest, res: Response) => {
    try {
        const coupon = await couponService.createCoupon(req.body);
        res.status(201).json({
            message: "Tạo mã giảm giá thành công",
            data: coupon
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getCoupons = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await couponService.getCoupons(page, limit);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};

export const updateCoupon = async (req: AuthRequest, res: Response) => {
    try {
        const coupon = await couponService.updateCoupon(req.params.id as string, req.body);
        res.status(200).json({
            message: "Cập nhật mã giảm giá thành công",
            data: coupon
        });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Mã giảm giá không tồn tại" });
        }
        res.status(400).json({ message: error.message });
    }
};

export const deleteCoupon = async (req: AuthRequest, res: Response) => {
    try {
        await couponService.deleteCoupon(req.params.id as string);
        res.status(200).json({ message: "Xóa mã giảm giá thành công" });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Mã giảm giá không tồn tại" });
        }
        res.status(500).json({ message: "Lỗi Server" });
    }
};

export const validateCouponClient = async (req: Request, res: Response) => {
    try {
        const { code, orderValue } = req.body;
        const result = await couponService.validateCoupon(code, orderValue);

        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({
            valid: false,
            message: error.message
        });
    }
};
