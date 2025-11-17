import express from 'express';
import {
  loginController,
  registerController,
  getCurrentUserController,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Rate limiting removido - intentos ilimitados permitidos
router.post('/login', loginController);
router.post('/register', registerController);
router.get('/me', authenticate, getCurrentUserController);

export default router;

