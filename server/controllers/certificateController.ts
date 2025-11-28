import { Response, NextFunction } from 'express';
import {
  createCertificate,
  approveCertificate,
  rejectCertificate,
  getCertificates,
  getCertificateById,
} from '../services/certificateService.js';
import type { AuthRequest } from '../types/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

export const createCertificateController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
      return;
    }
    const certificateData = {
      ...req.body,
      requestedBy: req.user.id,
    };
    const certificate = await createCertificate(certificateData);

    res.status(201).json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

export const approveCertificateController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
      return;
    }
    const { id } = req.params;
    const certificate = await approveCertificate(parseInt(id, 10), req.user.id);

    res.json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectCertificateController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
      return;
    }
    const { id } = req.params;
    const { rejectionReason } = req.body as { rejectionReason?: string };
    const certificate = await rejectCertificate(
      parseInt(id, 10),
      req.user.id,
      rejectionReason || ''
    );

    res.json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

export const getCertificatesController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = req.query;
    const result = await getCertificates(filters);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getCertificateByIdController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const certificate = await getCertificateById(parseInt(id, 10));

    if (!certificate) {
      res.status(404).json({
        success: false,
        message: 'Certificado no encontrado',
      });
      return;
    }

    res.json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadCertificatePDFController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const certificate = await getCertificateById(parseInt(id, 10));

    if (!certificate) {
      res.status(404).json({
        success: false,
        message: 'Certificado no encontrado',
      });
      return;
    }

    if (!certificate.pdfPath) {
      res.status(404).json({
        success: false,
        message: 'El PDF no está disponible para este certificado',
      });
      return;
    }

    if (certificate.status !== 'aprobado') {
      res.status(400).json({
        success: false,
        message: 'El certificado debe estar aprobado para descargar el PDF',
      });
      return;
    }

    // Construir la ruta completa del archivo
    // Usar la misma lógica que en certificateService.ts
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // El pdfPath viene como "/uploads/certificates/CODIGO.pdf"
    // Necesitamos construir la ruta desde la raíz del proyecto (server/dist/controllers -> server/dist -> server -> uploads)
    // O mejor, usar la misma estructura que certificateService: __dirname/../../uploads/certificates
    const certificatesDir = path.join(__dirname, '../../uploads/certificates');
    const fileName = path.basename(certificate.pdfPath);
    const filePath = path.join(certificatesDir, fileName);

    // Verificar que el archivo existe
    try {
      await fs.access(filePath);
    } catch {
      res.status(404).json({
        success: false,
        message: 'El archivo PDF no se encontró en el servidor',
      });
      return;
    }

    // Configurar headers para descarga de PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${certificate.code}.pdf"`);
    
    // Enviar el archivo
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

