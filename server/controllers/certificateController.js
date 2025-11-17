import {
  createCertificate,
  approveCertificate,
  rejectCertificate,
  getCertificates,
  getCertificateById,
} from '../services/certificateService.js';

export const createCertificateController = async (req, res, next) => {
  try {
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

export const approveCertificateController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const certificate = await approveCertificate(id, req.user.id);

    res.json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectCertificateController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const certificate = await rejectCertificate(id, req.user.id, rejectionReason);

    res.json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

export const getCertificatesController = async (req, res, next) => {
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

export const getCertificateByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const certificate = await getCertificateById(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificado no encontrado',
      });
    }

    res.json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

