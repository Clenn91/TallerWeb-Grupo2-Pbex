import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';
import type { AlertData, CertificateData } from '../types/index.js';

dotenv.config();

const isEmailEnabled = process.env.MAIL_ENABLED === 'true';

let transporter: Transporter | null = null;

if (isEmailEnabled) {
  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });
}

interface EmailResult {
  success: boolean;
  message?: string;
  messageId?: string;
}

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text: string = ''
): Promise<EmailResult> => {
  if (!isEmailEnabled) {
    console.log('📧 Email deshabilitado. Mensaje que se habría enviado:');
    console.log(`   Para: ${to}`);
    console.log(`   Asunto: ${subject}`);
    return { success: false, message: 'Email deshabilitado' };
  }

  if (!transporter) {
    console.error('✗ Transporter de email no configurado');
    return { success: false, message: 'Email no configurado' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME || 'Sistema Pbex'}" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`✓ Email enviado: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('✗ Error al enviar email:', errorMessage);
    return { success: false, message: errorMessage };
  }
};

export const sendAlertEmail = async (to: string, alertData: AlertData): Promise<EmailResult> => {
  const subject = `🚨 Alerta de Calidad - ${alertData.productName}`;
  const html = `
    <h2>Alerta de Calidad</h2>
    <p>Se ha detectado una alerta en el sistema de calidad:</p>
    <ul>
      <li><strong>Producto:</strong> ${alertData.productName}</li>
      <li><strong>Lote:</strong> ${alertData.lotNumber || 'N/A'}</li>
      <li><strong>Porcentaje de Merma:</strong> ${alertData.wastePercentage}%</li>
      <li><strong>Umbral Configurado:</strong> ${alertData.threshold}%</li>
      <li><strong>Fecha:</strong> ${new Date(alertData.date).toLocaleString('es-PE')}</li>
    </ul>
    <p>Por favor, revise el registro en el sistema.</p>
  `;

  return await sendEmail(to, subject, html);
};

export const sendCertificateNotification = async (
  to: string,
  certificateData: CertificateData
): Promise<EmailResult> => {
  const subject = `📄 Certificado de Calidad - ${certificateData.code}`;
  const html = `
    <h2>Certificado de Calidad Disponible</h2>
    <p>Se ha generado un nuevo certificado de calidad:</p>
    <ul>
      <li><strong>Código:</strong> ${certificateData.code}</li>
      <li><strong>Producto:</strong> ${certificateData.productName}</li>
      <li><strong>Lote:</strong> ${certificateData.lotNumber || 'N/A'}</li>
      <li><strong>Estado:</strong> ${certificateData.status}</li>
      <li><strong>Fecha:</strong> ${new Date(certificateData.date).toLocaleString('es-PE')}</li>
    </ul>
    <p>Puede descargar el certificado desde el sistema.</p>
  `;

  return await sendEmail(to, subject, html);
};

export { isEmailEnabled };

