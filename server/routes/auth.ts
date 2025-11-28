import express, { Router } from 'express';
import {
  loginController,
  registerController,
  getCurrentUserController,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/security.js';

const router: Router = express.Router();

router.post('/login', authLimiter, loginController);
router.post('/register', authLimiter, registerController);
router.get('/me', authenticate, getCurrentUserController);

export default router;

