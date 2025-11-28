import express, { Router } from 'express';
import {
  getUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
  deleteUserController,
  updateUserPasswordController,
} from '../controllers/userController.js';
import { authenticate, authorize, validateRoleCreation } from '../middleware/auth.js';
import { USER_ROLES } from '../config/constants.js';

const router: Router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Solo administradores pueden gestionar usuarios
router.get(
  '/',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
  getUsersController
);
router.get(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
  getUserByIdController
);
router.post(
  '/',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
  validateRoleCreation,
  createUserController
);
router.put(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR),
  validateRoleCreation,
  updateUserController
);
router.delete(
  '/:id',
  authorize(USER_ROLES.ADMIN),
  deleteUserController
);
router.patch(
  '/:id/password',
  authorize(USER_ROLES.ADMIN),
  updateUserPasswordController
);

export default router;

