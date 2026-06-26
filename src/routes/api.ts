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

const router = Router();

// Lắp ráp validateRequest(schema) vào trước Controller

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

export default router;
