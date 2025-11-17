import express from 'express';
import {
  createNonConformityController,
  getNonConformitiesController,
  resolveNonConformityController,
  updateNonConformityStatusController,
} from '../controllers/nonConformityController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

// Rutas protegidas - requieren autenticación
router.use(authenticate);

// Crear no conformidad
router.post(
  '/',
  authorize(USER_ROLES.ASSISTANT, USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN),
  createNonConformityController
);

// Obtener no conformidades
router.get('/', getNonConformitiesController);

// Resolver/actualizar no conformidad
router.patch(
  '/:id/resolve',
  authorize(USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN),
  resolveNonConformityController
);
router.patch(
  '/:id/status',
  authorize(USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN),
  updateNonConformityStatusController
);

export default router;

