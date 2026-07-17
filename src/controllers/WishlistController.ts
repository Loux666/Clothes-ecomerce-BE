import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as wishlistService from '../services/WishlistService';

export const getMyWishlist = async (req: AuthRequest, res: Response) => {
    const wishlist = await wishlistService.getMyWishlist(req.user!.id);
    res.status(200).json({ data: wishlist });
};

export const toggleWishlist = async (req: AuthRequest, res: Response) => {
    const result = await wishlistService.toggleWishlist(req.user!.id, req.body.productId);
    res.status(200).json({ message: "Cập nhật wishlist thành công", data: result });
};
