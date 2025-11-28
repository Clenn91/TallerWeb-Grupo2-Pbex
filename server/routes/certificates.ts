import express, { Router } from 'express';
import {
  createCertificateController,
  approveCertificateController,
  rejectCertificateController,
  getCertificatesController,
  getCertificateByIdController,
  downloadCertificatePDFController,
} from '../controllers/certificateController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../config/constants.js';

const router: Router = express.Router();

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

// Descargar PDF del certificado (debe ir antes de /:id para que Express no interprete "download" como un ID)
router.get('/:id/download', downloadCertificatePDFController);

router.get('/:id', getCertificateByIdController);

export default router;

