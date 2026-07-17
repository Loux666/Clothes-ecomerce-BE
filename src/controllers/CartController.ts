import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getCartItems } from '../services/CartService';
import { addToCart } from '../services/CartService';
import { updateCartItem } from '../services/CartService';
import { removeCartItem } from '../services/CartService';

export const getCartItemsController = async (req: AuthRequest, res: Response): Promise<void> => {
    const cart = await getCartItems(req.user!.id);
    res.json({
        message: 'Lấy giỏ hàng thành công',
        data: cart
    });
};
export const addToCartController = async (req: AuthRequest, res: Response): Promise<void> => {
    const { variantId, quantity } = req.body;
    const cartItem = await addToCart(req.user!.id, { variantId, quantity });
    res.json({
        message: 'Thêm vào giỏ hàng thành công',
        data: cartItem
    });
};

export const updateCartItemController = async (req: AuthRequest, res: Response): Promise<void> => {
    const variantId = req.params.variantId as string; // Lấy từ /cart/:variantId
    const { quantity } = req.body;
    
    const cartItem = await updateCartItem(req.user!.id, variantId, quantity);
    res.json({
        message: 'Cập nhật số lượng thành công',
        data: cartItem
    });
};

export const removeCartItemController = async (req: AuthRequest, res: Response): Promise<void> => {
    const variantId = req.params.variantId as string; // Lấy từ /cart/:variantId
    
    await removeCartItem(req.user!.id, variantId);
    res.json({
        message: 'Đã xóa sản phẩm khỏi giỏ hàng'
    });
};