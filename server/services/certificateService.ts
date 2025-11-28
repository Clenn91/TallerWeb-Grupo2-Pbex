import { Certificate, ProductionRecord, QualityControl, Product, User, Defect } from '../models/index.js';
import puppeteer from 'puppeteer';
import { sendCertificateNotification, isEmailEnabled } from '../config/email.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import type {
  CertificateInstance,
  PaginationResult,
} from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorio de certificados si no existe
const certificatesDir = path.join(__dirname, '../../uploads/certificates');
// Inicializar directorio de forma asíncrona cuando se necesite
const ensureCertificatesDir = async (): Promise<void> => {
  await fs.mkdir(certificatesDir, { recursive: true }).catch(() => {});
};

const generateCertificateCode = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CERT-${timestamp}-${random}`;
};

interface CertificateData {
  productId: number;
  productionRecordId: number;
  qualityControlId?: number | null;
  requestedBy: number;
}

interface CertificateFilters {
  productId?: number;
  status?: string;
  page?: number;
  limit?: number;
}

export const createCertificate = async (
  certificateData: CertificateData
): Promise<CertificateInstance> => {
  const {
    productId,
    productionRecordId,
    qualityControlId,
    requestedBy,
  } = certificateData;

  // Validar que el registro de producción existe
  const productionRecord = await ProductionRecord.findByPk(productionRecordId);
  if (!productionRecord) {
    throw new Error('Registro de producción no encontrado');
  }

  // Validar que el registro de producción tenga al menos un control de calidad
  const qualityControls = await QualityControl.findAll({
    where: { productionRecordId },
  });

  if (qualityControls.length === 0) {
    throw new Error('El registro de producción debe tener al menos un control de calidad');
  }

  // Si se especifica un control de calidad, validar que pertenezca al registro
  if (qualityControlId) {
    const qualityControl = await QualityControl.findByPk(qualityControlId);
    if (!qualityControl) {
      throw new Error('Control de calidad no encontrado');
    }
    if (qualityControl.productionRecordId !== productionRecordId) {
      throw new Error('El control de calidad no pertenece al registro de producción seleccionado');
    }
  }

  // Validar que el producto coincida
  if (productionRecord.productId !== productId) {
    throw new Error('El producto no coincide con el registro de producción');
  }

  const code = generateCertificateCode();

  const certificate = await Certificate.create({
    code,
    productId,
    productionRecordId,
    qualityControlId: qualityControlId || null,
    requestedBy,
    status: 'pendiente',
  });

  return await Certificate.findByPk(certificate.id, {
    include: [
      { model: Product, as: 'product' },
      { model: ProductionRecord, as: 'productionRecord' },
      { model: QualityControl, as: 'qualityControl' },
      { model: User, as: 'requester' },
    ],
  }) as CertificateInstance;
};

export const approveCertificate = async (
  certificateId: number,
  approvedBy: number
): Promise<CertificateInstance> => {
  const certificate = await Certificate.findByPk(certificateId, {
    include: [
      { model: Product, as: 'product' },
      { model: ProductionRecord, as: 'productionRecord' },
      { model: QualityControl, as: 'qualityControl', include: [{ model: Defect, as: 'defects' }] },
      { model: User, as: 'requester' },
    ],
  }) as CertificateInstance | null;

  if (!certificate) {
    throw new Error('Certificado no encontrado');
  }

  if (certificate.status !== 'pendiente') {
    throw new Error('El certificado ya fue procesado');
  }

  // Generar PDF
  const pdfPath = await generateCertificatePDF(certificate);

  // Actualizar certificado
  await certificate.update({
    status: 'aprobado',
    approvedBy,
    approvedAt: new Date(),
    pdfPath,
  });

  // Enviar notificación si está configurado
  const certificateWithRelations = await Certificate.findByPk(certificateId, {
    include: [
      { model: Product, as: 'product' },
      { model: ProductionRecord, as: 'productionRecord' },
      { model: User, as: 'requester' },
    ],
  });
  if (isEmailEnabled && certificateWithRelations) {
    const requester = (certificateWithRelations as any).requester;
    if (requester && requester.email) {
      const product = (certificateWithRelations as any).product;
      const productionRecord = (certificateWithRelations as any).productionRecord;
      await sendCertificateNotification(requester.email, {
        code: certificate.code,
        productName: product?.name || 'N/A',
        lotNumber: productionRecord?.lotNumber || 'N/A',
        status: 'aprobado',
        date: certificate.approvedAt || new Date(),
      });
    }
  }

  return await Certificate.findByPk(certificateId, {
    include: [
      { model: Product, as: 'product' },
      { model: ProductionRecord, as: 'productionRecord' },
      { model: QualityControl, as: 'qualityControl' },
      { model: User, as: 'requester' },
      { model: User, as: 'approver' },
    ],
  }) as CertificateInstance;
};

export const rejectCertificate = async (
  certificateId: number,
  approvedBy: number,
  rejectionReason: string
): Promise<CertificateInstance> => {
  const certificate = await Certificate.findByPk(certificateId) as CertificateInstance | null;

  if (!certificate) {
    throw new Error('Certificado no encontrado');
  }

  if (certificate.status !== 'pendiente') {
    throw new Error('El certificado ya fue procesado');
  }

  await certificate.update({
    status: 'rechazado',
    approvedBy,
    rejectionReason,
  });

  return await Certificate.findByPk(certificateId, {
    include: [
      { model: Product, as: 'product' },
      { model: ProductionRecord, as: 'productionRecord' },
      { model: User, as: 'requester' },
      { model: User, as: 'approver' },
    ],
  }) as CertificateInstance;
};

const generateCertificatePDF = async (certificate: CertificateInstance): Promise<string> => {
  await ensureCertificatesDir();
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ...(process.env.PUPPETEER_EXECUTABLE_PATH && {
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    }),
  });

  try {
    const page = await browser.newPage();

    // Cargar relaciones antes de generar HTML
    const certificateWithRelations = await Certificate.findByPk(certificate.id, {
      include: [
        { model: Product, as: 'product' },
        { model: ProductionRecord, as: 'productionRecord' },
        { model: QualityControl, as: 'qualityControl' },
      ],
    });
    const htmlContent = generateCertificateHTML(certificateWithRelations as any);

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfPath = path.join(certificatesDir, `${certificate.code}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });

    return `/uploads/certificates/${certificate.code}.pdf`;
  } finally {
    await browser.close();
  }
};

const generateCertificateHTML = (certificate: any): string => {
  const product = certificate?.product;
  const productionRecord = certificate?.productionRecord;
  const qualityControl = certificate?.qualityControl;
  const defects = qualityControl?.defects || [];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #0066cc;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #0066cc;
          margin: 0;
        }
        .certificate-info {
          margin: 20px 0;
        }
        .info-row {
          display: flex;
          margin: 10px 0;
        }
        .info-label {
          font-weight: bold;
          width: 200px;
        }
        .info-value {
          flex: 1;
        }
        .section {
          margin: 30px 0;
          padding: 15px;
          background-color: #f5f5f5;
          border-radius: 5px;
        }
        .section h2 {
          color: #0066cc;
          margin-top: 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        th {
          background-color: #0066cc;
          color: white;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>CERTIFICADO DE CALIDAD</h1>
        <p><strong>Código:</strong> ${certificate.code}</p>
      </div>

      <div class="certificate-info">
        <div class="info-row">
          <div class="info-label">Producto:</div>
          <div class="info-value">${product?.name || 'N/A'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Número de Lote:</div>
          <div class="info-value">${productionRecord?.lotNumber || 'N/A'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Fecha de Producción:</div>
          <div class="info-value">${productionRecord?.productionDate ? new Date(productionRecord.productionDate).toLocaleDateString('es-PE') : 'N/A'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Turno:</div>
          <div class="info-value">${productionRecord?.shift || 'N/A'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Total Producido:</div>
          <div class="info-value">${productionRecord?.totalProduced || 0} unidades</div>
        </div>
        <div class="info-row">
          <div class="info-label">Total Aprobado:</div>
          <div class="info-value">${productionRecord?.totalApproved || 0} unidades</div>
        </div>
        <div class="info-row">
          <div class="info-label">Total Rechazado:</div>
          <div class="info-value">${productionRecord?.totalRejected || 0} unidades</div>
        </div>
      </div>

      ${qualityControl ? `
      <div class="section">
        <h2>Control de Calidad</h2>
        <div class="info-row">
          <div class="info-label">Peso:</div>
          <div class="info-value">${qualityControl.weight || 'N/A'} g</div>
        </div>
        <div class="info-row">
          <div class="info-label">Diámetro:</div>
          <div class="info-value">${qualityControl.diameter || 'N/A'} mm</div>
        </div>
        <div class="info-row">
          <div class="info-label">Altura:</div>
          <div class="info-value">${qualityControl.height || 'N/A'} mm</div>
        </div>
        <div class="info-row">
          <div class="info-label">Porcentaje de Merma:</div>
          <div class="info-value">${qualityControl.wastePercentage}%</div>
        </div>
        <div class="info-row">
          <div class="info-label">Estado:</div>
          <div class="info-value">${qualityControl.approved ? 'Aprobado' : 'Rechazado'}</div>
        </div>
      </div>
      ` : ''}

      ${defects.length > 0 ? `
      <div class="section">
        <h2>Defectos Registrados</h2>
        <table>
          <thead>
            <tr>
              <th>Tipo de Defecto</th>
              <th>Cantidad</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            ${defects.map((defect: any) => `
              <tr>
                <td>${defect.defectType}</td>
                <td>${defect.quantity}</td>
                <td>${defect.description || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <div class="footer">
        <p>Este certificado fue generado el ${new Date().toLocaleString('es-PE')}</p>
        <p>Plásticos Básicos de Exportación S.A.C.</p>
        <p>RUC: 20101607233</p>
      </div>
    </body>
    </html>
  `;
};

export const getCertificates = async (
  filters: CertificateFilters = {}
): Promise<PaginationResult<CertificateInstance>> => {
  const {
    productId,
    status,
    page = 1,
    limit = 20,
  } = filters;

  const where: any = {};
  if (productId) where.productId = productId;
  if (status) where.status = status;

  const offset = (page - 1) * limit;

  const { count, rows } = await Certificate.findAndCountAll({
    where,
    include: [
      { model: Product, as: 'product' },
      { model: ProductionRecord, as: 'productionRecord' },
      { model: User, as: 'requester' },
      { model: User, as: 'approver' },
    ],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    data: rows as CertificateInstance[],
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const getCertificateById = async (
  certificateId: number
): Promise<CertificateInstance | null> => {
  return await Certificate.findByPk(certificateId, {
    include: [
      { model: Product, as: 'product' },
      { model: ProductionRecord, as: 'productionRecord' },
      { model: QualityControl, as: 'qualityControl', include: [{ model: Defect, as: 'defects' }] },
      { model: User, as: 'requester' },
      { model: User, as: 'approver' },
    ],
  }) as CertificateInstance | null;
};

