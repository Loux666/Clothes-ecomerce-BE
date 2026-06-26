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

export default router;
