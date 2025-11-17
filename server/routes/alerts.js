import express from 'express';
import {
  getAlertsController,
  resolveAlertController,
  dismissAlertController,
} from '../controllers/alertController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

// Rutas protegidas - requieren autenticación
router.use(authenticate);

// Obtener alertas
router.get('/', getAlertsController);

// Resolver/descartar alertas (solo supervisor/admin)
router.patch(
  '/:id/resolve',
  authorize(USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN),
  resolveAlertController
);
router.patch(
  '/:id/dismiss',
  authorize(USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN),
  dismissAlertController
);

export default router;

