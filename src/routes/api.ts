import { Router } from 'express';
import { login } from '../controllers/AuthController';
import { register } from '../controllers/AuthController';
import { getUserProfile } from '../controllers/UserController';
import { verifyToken } from '../middlewares/authMiddleware';
import { logout, verifyOtp } from '../controllers/AuthController';
import { updateUserProfile } from '../controllers/UserController';
import { uploadFiles } from '../controllers/upload.controller';
import { upload } from '../middlewares/upload.middleware';

import { getAllCategoriesController, createCategoryController, updateCategoryController, deleteCategoryController } from '../controllers/CategoryController';

// Import Middleware và Schema
import { validateRequest } from '../middlewares/validateMiddleware';
import { loginSchema, registerSchema, updateProfileSchema } from '../validations/auth.validation';
import { createCategorySchema, updateCategorySchema } from '../validations/category.validation';
import { createAttributeSchema, updateAttributeSchema, createAttributeValueSchema, updateAttributeValueSchema } from '../validations/attribute.validation';
import { getAllAttributesController, createAttributeController, updateAttributeController, deleteAttributeController, createAttributeValueController, updateAttributeValueController, deleteAttributeValueController } from '../controllers/AttributeController';
import { createProductSchema, updateProductSchema, updateStockSchema } from '../validations/product.validation';
import { getAllProductsController, createProductController, getProductBySlugController, updateProductController, updateVariantStockController } from '../controllers/ProductController';
import { getCartItemsController, addToCartController, updateCartItemController, removeCartItemController } from '../controllers/CartController';
import { addToCartValidation, updateCartValidation } from '../validations/cart.validation';
import { createCoupon, getCoupons, updateCoupon, deleteCoupon, validateCouponClient } from '../controllers/CouponController';
import { createCouponSchema, updateCouponSchema, validateCouponSchema } from '../validations/coupon.validation';


const router = Router();


//Auth + User
router.post('/login', validateRequest(loginSchema), login);
router.post('/register', validateRequest(registerSchema), register);
router.post('/otp/verify', verifyOtp);
router.post('/logout', logout);
router.get('/profile', verifyToken, getUserProfile);
router.put('/profile', verifyToken, validateRequest(updateProfileSchema), updateUserProfile);

// Upload API
router.post('/upload', verifyToken, upload.array('files', 5), uploadFiles);

//Category
router.get('/categories', getAllCategoriesController);
router.post('/categories', verifyToken, validateRequest(createCategorySchema), createCategoryController);
router.put('/categories/:id', verifyToken, validateRequest(updateCategorySchema), updateCategoryController);
router.delete('/categories/:id', verifyToken, deleteCategoryController);

// Attribute
router.get('/attributes', verifyToken, getAllAttributesController);
router.post('/attributes', verifyToken, validateRequest(createAttributeSchema), createAttributeController);
router.put('/attributes/:id', verifyToken, validateRequest(updateAttributeSchema), updateAttributeController);
router.delete('/attributes/:id', verifyToken, deleteAttributeController);

// Attribute Values
router.post('/attributes/:id/values', verifyToken, validateRequest(createAttributeValueSchema), createAttributeValueController);
router.put('/attributes/values/:id', verifyToken, validateRequest(updateAttributeValueSchema), updateAttributeValueController);
router.delete('/attributes/values/:id', verifyToken, deleteAttributeValueController);

// Product
router.get('/products', getAllProductsController); // Public: Khách xem danh sách sản phẩm
router.get('/products/:slug', getProductBySlugController); // Public: Khách xem chi tiết 1 sản phẩm
router.post('/products', verifyToken, validateRequest(createProductSchema), createProductController); // Private: Admin thêm sản phẩm
router.put('/products/:id', verifyToken, validateRequest(updateProductSchema), updateProductController); // Private: Admin sửa sản phẩm

// Variant Stock
router.patch('/variants/:variantId/stock', verifyToken, validateRequest(updateStockSchema), updateVariantStockController); // Private: Admin điều chỉnh kho

// Cart
router.get('/cart', verifyToken, getCartItemsController); // Lấy giỏ hàng
router.post('/cart', verifyToken, validateRequest(addToCartValidation), addToCartController); // Thêm vào giỏ
router.put('/cart/:variantId', verifyToken, validateRequest(updateCartValidation), updateCartItemController); // Cập nhật số lượng
router.delete('/cart/:variantId', verifyToken, removeCartItemController); // Xóa khỏi giỏ

// Coupon
router.get('/admin/coupons', verifyToken, getCoupons);
router.post('/admin/coupons', verifyToken, validateRequest(createCouponSchema), createCoupon);
router.put('/admin/coupons/:id', verifyToken, validateRequest(updateCouponSchema), updateCoupon);
router.delete('/admin/coupons/:id', verifyToken, deleteCoupon);

// Frontend Coupon Validation (không bắt buộc login để test mã)
router.post('/coupons/validate', validateRequest(validateCouponSchema), validateCouponClient);

// ==========================================
// Order (Đặt hàng & Quản lý đơn)
// ==========================================
import { checkout, checkPaymentStatus, getMyOrders, getMyOrderDetails, getAllOrdersAdmin, getOrderDetailsAdmin, updateOrderStatus, cancelOrder } from '../controllers/OrderController';
import { checkoutSchema, updateOrderStatusSchema, cancelOrderSchema } from '../validations/order.validation';

// Public/Auth - Đặt hàng (Có thể không cần login, hoặc cần login tùy requirement, hiện tại check user id nếu có)
// Ghi chú: Có thể thêm middleware tự chọn `optionalAuth` nếu muốn guest vẫn checkout được, hoặc dùng verifyToken
router.post('/orders/checkout', verifyToken, validateRequest(checkoutSchema), checkout);
router.get('/orders/:orderCode/payment-status', checkPaymentStatus); // Phục vụ Frontend polling trạng thái thanh toán

// User - Lịch sử đơn hàng
router.get('/orders/me', verifyToken, getMyOrders);
router.get('/orders/me/:id', verifyToken, getMyOrderDetails);
router.put('/orders/:id/cancel', verifyToken, validateRequest(cancelOrderSchema), cancelOrder);

// Admin - Quản lý đơn
router.get('/admin/orders', verifyToken, getAllOrdersAdmin); // Nên thêm `authorizeRoles('ADMIN')`
router.get('/admin/orders/:id', verifyToken, getOrderDetailsAdmin);
router.put('/admin/orders/:id/status', verifyToken, validateRequest(updateOrderStatusSchema), updateOrderStatus);
router.put('/admin/orders/:id/cancel', verifyToken, validateRequest(cancelOrderSchema), cancelOrder);

// ==========================================
// Webhooks
// ==========================================
import { sepayWebhook } from '../controllers/WebhookController';

// SePay gọi vào endpoint này khi có giao dịch ngân hàng mới
router.post('/webhooks/sepay', sepayWebhook);

// ==========================================
// Inventory (Quản lý kho)
// ==========================================
import { getInventoryLogs, manualRestock } from '../controllers/InventoryController';
import { manualRestockSchema } from '../validations/inventory.validation';

// Admin - Quản lý nhập xuất kho
router.get('/admin/inventory/logs', verifyToken, getInventoryLogs);
router.post('/admin/inventory/restock', verifyToken, validateRequest(manualRestockSchema), manualRestock);

// ==========================================
// Address Book (Sổ địa chỉ)
// ==========================================
import { getMyAddresses, createAddress, updateAddress, deleteAddress } from '../controllers/AddressController';
import { addressSchema } from '../validations/address.validation';

router.get('/profile/addresses', verifyToken, getMyAddresses);
router.post('/profile/addresses', verifyToken, validateRequest(addressSchema), createAddress);
router.put('/profile/addresses/:id', verifyToken, validateRequest(addressSchema), updateAddress);
router.delete('/profile/addresses/:id', verifyToken, deleteAddress);

// ==========================================
// Wishlist (Yêu thích)
// ==========================================
import { getMyWishlist, toggleWishlist } from '../controllers/WishlistController';
import { toggleWishlistSchema } from '../validations/wishlist.validation';

router.get('/wishlist', verifyToken, getMyWishlist);
router.post('/wishlist', verifyToken, validateRequest(toggleWishlistSchema), toggleWishlist);

// ==========================================
// Reviews (Đánh giá)
// ==========================================
import { createReview, getProductReviews, getAllReviewsAdmin, updateReviewStatus } from '../controllers/ReviewController';
import { createReviewSchema, updateReviewStatusSchema } from '../validations/review.validation';

router.post('/reviews', verifyToken, validateRequest(createReviewSchema), createReview);
router.get('/products/:id/reviews', getProductReviews);
router.get('/admin/reviews', verifyToken, getAllReviewsAdmin);
router.put('/admin/reviews/:id/status', verifyToken, validateRequest(updateReviewStatusSchema), updateReviewStatus);

// ==========================================
// CMS / Settings (Cấu hình trang chủ)
// ==========================================
import { getHomepageSettings, getSettingAdmin, updateSettingAdmin } from '../controllers/SettingController';
import { updateSettingSchema } from '../validations/setting.validation';

router.get('/settings/homepage', getHomepageSettings);
router.get('/admin/settings/:key', verifyToken, getSettingAdmin);
router.put('/admin/settings/:key', verifyToken, validateRequest(updateSettingSchema), updateSettingAdmin);

export default router;
