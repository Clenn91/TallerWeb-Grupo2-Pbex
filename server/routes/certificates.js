import express from 'express';
import {
  createCertificateController,
  approveCertificateController,
  rejectCertificateController,
  getCertificatesController,
  getCertificateByIdController,
} from '../controllers/certificateController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

// Rutas protegidas - requieren autenticación
router.use(authenticate);

// Crear certificado (asistente puede crear)
router.post(
  '/',
  authorize(USER_ROLES.ASSISTANT, USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN),
  createCertificateController
);

// Aprobar/rechazar certificado (solo supervisor/admin)
router.patch(
  '/:id/approve',
  authorize(USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN),
  approveCertificateController
);
router.patch(
  '/:id/reject',
  authorize(USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN),
  rejectCertificateController
);

// Obtener certificados
router.get('/', getCertificatesController);
router.get('/:id', getCertificateByIdController);

export default router;

