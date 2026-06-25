import { Router } from 'express';
import { login } from '../controllers/AuthController';
import { register } from '../controllers/AuthController';
import { getUserProfile } from '../controllers/UserController';
import { verifyToken } from '../middlewares/authMiddleware';
import { logout, verifyOtp } from '../controllers/AuthController';
import { updateUserProfile } from '../controllers/UserController';

// Import Middleware và Schema
import { validateRequest } from '../middlewares/validateMiddleware';
import { loginSchema, registerSchema, updateProfileSchema } from '../validations/auth.validation';

const router = Router();

// Lắp ráp validateRequest(schema) vào trước Controller
router.post('/login', validateRequest(loginSchema), login);
router.post('/register', validateRequest(registerSchema), register);
router.post('/otp/verify', verifyOtp);
router.post('/logout', logout);
router.get('/profile', verifyToken, getUserProfile);
router.put('/profile', verifyToken, validateRequest(updateProfileSchema), updateUserProfile);

export default router;
