import { Request, Response } from 'express';
import * as couponService from '../services/CouponService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ApiError } from '../utils/ApiError';

export const createCoupon = async (req: AuthRequest, res: Response) => {
    const coupon = await couponService.createCoupon(req.body);
    res.status(201).json({
        message: "Tạo mã giảm giá thành công",
        data: coupon
    });
};

export const getCoupons = async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await couponService.getCoupons(page, limit);
    res.status(200).json(result);
};

export const updateCoupon = async (req: AuthRequest, res: Response) => {
    const couponId = req.params.id as string;
    if (!couponId) {
        throw new ApiError(400, 'Thiếu mã giảm giá cần cập nhật');
    }
    const coupon = await couponService.updateCoupon(couponId, req.body);
    res.status(200).json({
        message: "Cập nhật mã giảm giá thành công",
        data: coupon
    });
};

export const deleteCoupon = async (req: AuthRequest, res: Response) => {
    const couponId = req.params.id as string;
    if (!couponId) {
        throw new ApiError(400, 'Thiếu mã giảm giá cần xóa');
    }
    await couponService.deleteCoupon(couponId);
    res.status(200).json({ message: "Xóa mã giảm giá thành công" });
};

export const validateCouponClient = async (req: Request, res: Response) => {
    const { code, orderValue } = req.body;
    const result = await couponService.validateCoupon(code, orderValue);

    res.status(200).json(result);
};
