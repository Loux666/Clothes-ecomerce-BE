import { Router } from 'express';
import { getHomePage } from '../controllers/HomeController';

const router = Router();

router.get('/', getHomePage);

export default router;
