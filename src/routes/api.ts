import { Router } from 'express';
import { login, refreshToken } from '../controllers/AuthController';
import { register } from '../controllers/AuthController';
import { getUserProfile } from '../controllers/UserController';
import { verifyToken } from '../middlewares/authMiddleware';
import { logout, verifyOtp } from '../controllers/AuthController';
import { updateUserProfile, getUsersAdmin, updateUserStatus } from '../controllers/UserController';
import { uploadFiles } from '../controllers/upload.controller';
import { upload } from '../middlewares/upload.middleware';

import { getAllCategoriesController, createCategoryController, updateCategoryController, deleteCategoryController } from '../controllers/CategoryController';
import * as collectionController from '../controllers/CollectionController';

// Import Middleware và Schema
import { validateRequest } from '../middlewares/validateMiddleware';
import { loginSchema, registerSchema, updateProfileSchema } from '../validations/auth.validation';
import { createCategorySchema, updateCategorySchema } from '../validations/category.validation';
import { createAttributeSchema, updateAttributeSchema, createAttributeValueSchema, updateAttributeValueSchema } from '../validations/attribute.validation';
import { getAllAttributesController, createAttributeController, updateAttributeController, deleteAttributeController, createAttributeValueController, updateAttributeValueController, deleteAttributeValueController } from '../controllers/AttributeController';
import { createProductSchema, updateProductSchema, updateStockSchema } from '../validations/product.validation';
import { getAllProductsController, createProductController, getProductBySlugController, updateProductController, updateVariantStockController, deleteProductController, updateVariantController, deleteVariantController } from '../controllers/ProductController';
import { getCartItemsController, addToCartController, updateCartItemController, removeCartItemController } from '../controllers/CartController';
import { addToCartValidation, updateCartValidation } from '../validations/cart.validation';
import { createCoupon, getCoupons, updateCoupon, deleteCoupon, validateCouponClient } from '../controllers/CouponController';
import { createCouponSchema, updateCouponSchema, validateCouponSchema } from '../validations/coupon.validation';
import { asyncHandler } from '../utils/asyncHandler';


const router = Router();

const a = asyncHandler;


//Auth + User
router.post('/login', validateRequest(loginSchema), a(login));
router.post('/register', validateRequest(registerSchema), a(register));
router.post('/refresh-token', a(refreshToken));
router.post('/otp/verify', a(verifyOtp));
router.post('/logout', a(logout));
router.get('/profile', verifyToken, a(getUserProfile));
router.put('/profile', verifyToken, validateRequest(updateProfileSchema), a(updateUserProfile));

// Admin - Quản lý User
router.get('/admin/users', verifyToken, a(getUsersAdmin));
router.put('/admin/users/:id/status', verifyToken, a(updateUserStatus));

// Upload API
router.post('/upload', verifyToken, upload.array('files', 5), a(uploadFiles));

//Category
router.get('/categories', a(getAllCategoriesController));
router.post('/categories', verifyToken, validateRequest(createCategorySchema), a(createCategoryController));
router.put('/categories/:id', verifyToken, validateRequest(updateCategorySchema), a(updateCategoryController));
router.delete('/categories/:id', verifyToken, a(deleteCategoryController));

// Collection
router.get('/collections', a(collectionController.getAllCollections));
router.post('/collections', verifyToken, a(collectionController.createCollection)); // Should add validation
router.get('/collections/:slug', a(collectionController.getCollectionBySlug));
router.put('/collections/:id', verifyToken, a(collectionController.updateCollection));
router.delete('/collections/:id', verifyToken, a(collectionController.deleteCollection));

// Attribute
router.get('/attributes', verifyToken, a(getAllAttributesController));
router.post('/attributes', verifyToken, validateRequest(createAttributeSchema), a(createAttributeController));
router.put('/attributes/:id', verifyToken, validateRequest(updateAttributeSchema), a(updateAttributeController));
router.delete('/attributes/:id', verifyToken, a(deleteAttributeController));

// Attribute Values
router.post('/attributes/:id/values', verifyToken, validateRequest(createAttributeValueSchema), a(createAttributeValueController));
router.put('/attributes/values/:id', verifyToken, validateRequest(updateAttributeValueSchema), a(updateAttributeValueController));
router.delete('/attributes/values/:id', verifyToken, a(deleteAttributeValueController));

// Product
router.get('/products', a(getAllProductsController)); // Public: Khách xem danh sách sản phẩm
router.get('/products/:slug', a(getProductBySlugController)); // Public: Khách xem chi tiết 1 sản phẩm
router.post('/products', verifyToken, validateRequest(createProductSchema), a(createProductController)); // Private: Admin thêm sản phẩm
router.put('/products/:id', verifyToken, validateRequest(updateProductSchema), a(updateProductController)); // Private: Admin sửa sản phẩm

router.delete('/products/:id', verifyToken, a(deleteProductController)); // Private: Admin xóa sản phẩm

// Variant Stock
router.put('/variants/:variantId', verifyToken, a(updateVariantController)); // Private: Admin sửa biến thể
router.delete('/variants/:variantId', verifyToken, a(deleteVariantController)); // Private: Admin xóa biến thể
router.patch('/variants/:variantId/stock', verifyToken, validateRequest(updateStockSchema), a(updateVariantStockController)); // Private: Admin điều chỉnh kho

// Cart
router.get('/cart', verifyToken, a(getCartItemsController)); // Lấy giỏ hàng
router.post('/cart', verifyToken, validateRequest(addToCartValidation), a(addToCartController)); // Thêm vào giỏ
router.put('/cart/:variantId', verifyToken, validateRequest(updateCartValidation), a(updateCartItemController)); // Cập nhật số lượng
router.delete('/cart/:variantId', verifyToken, a(removeCartItemController)); // Xóa khỏi giỏ

// Coupon
router.get('/admin/coupons', verifyToken, a(getCoupons));
router.post('/admin/coupons', verifyToken, validateRequest(createCouponSchema), a(createCoupon));
router.put('/admin/coupons/:id', verifyToken, validateRequest(updateCouponSchema), a(updateCoupon));
router.delete('/admin/coupons/:id', verifyToken, a(deleteCoupon));

// Frontend Coupon Validation (không bắt buộc login để test mã)
router.post('/coupons/validate', validateRequest(validateCouponSchema), a(validateCouponClient));

// ==========================================
// Order (Đặt hàng & Quản lý đơn)
// ==========================================
import { checkout, checkPaymentStatus, getMyOrders, getMyOrderDetails, getAllOrdersAdmin, getOrderDetailsAdmin, updateOrderStatus, cancelOrder } from '../controllers/OrderController';
import { checkoutSchema, updateOrderStatusSchema, cancelOrderSchema } from '../validations/order.validation';

// Public/Auth - Đặt hàng (Có thể không cần login, hoặc cần login tùy requirement, hiện tại check user id nếu có)
// Ghi chú: Có thể thêm middleware tự chọn `optionalAuth` nếu muốn guest vẫn checkout được, hoặc dùng verifyToken
router.post('/orders/checkout', verifyToken, validateRequest(checkoutSchema), a(checkout));
router.get('/orders/:orderCode/payment-status', a(checkPaymentStatus)); // Phục vụ Frontend polling trạng thái thanh toán

// User - Lịch sử đơn hàng
router.get('/orders/me', verifyToken, a(getMyOrders));
router.get('/orders/me/:id', verifyToken, a(getMyOrderDetails));
router.put('/orders/:id/cancel', verifyToken, validateRequest(cancelOrderSchema), a(cancelOrder));

// Admin - Quản lý đơn
router.get('/admin/orders', verifyToken, a(getAllOrdersAdmin)); // Nên thêm `authorizeRoles('ADMIN')`
router.get('/admin/orders/:id', verifyToken, a(getOrderDetailsAdmin));
router.put('/admin/orders/:id/status', verifyToken, validateRequest(updateOrderStatusSchema), a(updateOrderStatus));
router.put('/admin/orders/:id/cancel', verifyToken, validateRequest(cancelOrderSchema), a(cancelOrder));

// ==========================================
// Webhooks
// ==========================================
import { sepayWebhook } from '../controllers/WebhookController';

// SePay gọi vào endpoint này khi có giao dịch ngân hàng mới
router.post('/webhooks/sepay', a(sepayWebhook));

// ==========================================
// Inventory (Quản lý kho)
// ==========================================
import { getInventoryLogs, manualRestock } from '../controllers/InventoryController';
import { manualRestockSchema } from '../validations/inventory.validation';

// Admin - Quản lý nhập xuất kho
router.get('/admin/inventory/logs', verifyToken, a(getInventoryLogs));
router.post('/admin/inventory/restock', verifyToken, validateRequest(manualRestockSchema), a(manualRestock));

// ==========================================
// Address Book (Sổ địa chỉ)
// ==========================================
import { getMyAddresses, createAddress, updateAddress, deleteAddress } from '../controllers/AddressController';
import { addressSchema } from '../validations/address.validation';

router.get('/profile/addresses', verifyToken, a(getMyAddresses));
router.post('/profile/addresses', verifyToken, validateRequest(addressSchema), a(createAddress));
router.put('/profile/addresses/:id', verifyToken, validateRequest(addressSchema), a(updateAddress));
router.delete('/profile/addresses/:id', verifyToken, a(deleteAddress));

// ==========================================
// Wishlist (Yêu thích)
// ==========================================
import { getMyWishlist, toggleWishlist } from '../controllers/WishlistController';
import { toggleWishlistSchema } from '../validations/wishlist.validation';

router.get('/wishlist', verifyToken, a(getMyWishlist));
router.post('/wishlist', verifyToken, validateRequest(toggleWishlistSchema), a(toggleWishlist));

// ==========================================
// Reviews (Đánh giá)
// ==========================================
import { createReview, getProductReviews, getAllReviewsAdmin, updateReviewStatus } from '../controllers/ReviewController';
import { createReviewSchema, updateReviewStatusSchema } from '../validations/review.validation';

router.post('/reviews', verifyToken, validateRequest(createReviewSchema), a(createReview));
router.get('/products/:id/reviews', a(getProductReviews));
router.get('/admin/reviews', verifyToken, a(getAllReviewsAdmin));
router.put('/admin/reviews/:id/status', verifyToken, validateRequest(updateReviewStatusSchema), a(updateReviewStatus));

// ==========================================
// CMS / Settings (Cấu hình trang chủ)
// ==========================================
import { getHomepageSettings, getSettingAdmin, updateSettingAdmin } from '../controllers/SettingController';
import { updateSettingSchema } from '../validations/setting.validation';

router.get('/settings/homepage', a(getHomepageSettings));
router.get('/admin/settings/:key', verifyToken, a(getSettingAdmin));
router.put('/admin/settings/:key', verifyToken, validateRequest(updateSettingSchema), a(updateSettingAdmin));

// ==========================================
// Dashboard Stats
// ==========================================
import { getDashboardStats } from '../controllers/DashboardController';
router.get('/admin/dashboard/stats', verifyToken, a(getDashboardStats));

export default router;
