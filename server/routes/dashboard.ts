import express, { Router } from 'express';
import {
  getDashboardMetricsController,
  getProductionTrendsController,
} from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../config/constants.js';

const router: Router = express.Router();

// Rutas protegidas - requieren autenticación
router.use(authenticate);

// Dashboard solo para roles con permisos
router.get(
  '/metrics',
  authorize(
    USER_ROLES.SUPERVISOR,
    USER_ROLES.ADMIN,
    USER_ROLES.MANAGEMENT
  ),
  getDashboardMetricsController
);
router.get(
  '/trends',
  authorize(
    USER_ROLES.SUPERVISOR,
    USER_ROLES.ADMIN,
    USER_ROLES.MANAGEMENT
  ),
  getProductionTrendsController
);

export default router;

