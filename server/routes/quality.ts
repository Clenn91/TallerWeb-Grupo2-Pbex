import express, { Router } from 'express';
import {
  createProductionRecordController,
  createQualityControlController,
  getQualityControlsController,
  getProductionRecordsController,
} from '../controllers/qualityController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../config/constants.js';

const router: Router = express.Router();

// Rutas protegidas - requieren autenticación
router.use(authenticate);

// Registro de producción
router.post(
  '/production-records',
  authorize(USER_ROLES.ASSISTANT, USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN),
  createProductionRecordController
);
router.get(
  '/production-records',
  getProductionRecordsController
);

// Control de calidad
router.post(
  '/quality-controls',
  authorize(USER_ROLES.ASSISTANT, USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN),
  createQualityControlController
);
router.get(
  '/quality-controls',
  getQualityControlsController
);

export default router;

