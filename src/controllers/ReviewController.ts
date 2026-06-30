import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as reviewService from '../services/ReviewService';

export const createReview = async (req: AuthRequest, res: Response) => {
    try {
        const review = await reviewService.createReview(req.user!.id, req.body);
        res.status(201).json({ message: "Đánh giá thành công. Đang chờ duyệt.", data: review });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getProductReviews = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const result = await reviewService.getProductReviews(req.params.id as string, page, limit);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getAllReviewsAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const status = req.query.status as string | undefined;

        const result = await reviewService.getAllReviewsAdmin(page, limit, status);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateReviewStatus = async (req: AuthRequest, res: Response) => {
    try {
        const review = await reviewService.updateReviewStatus(req.params.id as string, req.body.status);
        res.status(200).json({ message: "Cập nhật trạng thái thành công", data: review });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
