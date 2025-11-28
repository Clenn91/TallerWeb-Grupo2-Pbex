// Constantes del sistema

import type { UserRole, DefectType, Shift, CertificateStatus, AlertStatus } from '../types/index.js';

export const USER_ROLES: Record<string, UserRole> = {
  ASSISTANT: 'asistente_calidad',
  SUPERVISOR: 'supervisor',
  ADMIN: 'administrador',
  MANAGEMENT: 'gerencia',
  VISITOR: 'visitante',
} as const;

export const DEFECT_TYPES: Record<string, DefectType> = {
  MANCHA: 'mancha',
  REBABA: 'rebaba',
  INCOMPLETO: 'incompleto',
  DEFORMACION: 'deformacion',
  RAYON: 'rayon',
  OTRO: 'otro',
} as const;

export const SHIFTS: Record<string, Shift> = {
  MORNING: 'mañana',
  AFTERNOON: 'tarde',
  NIGHT: 'noche',
} as const;

export const CERTIFICATE_STATUS: Record<string, CertificateStatus> = {
  PENDING: 'pendiente',
  APPROVED: 'aprobado',
  REJECTED: 'rechazado',
} as const;

export const ALERT_STATUS: Record<string, AlertStatus> = {
  ACTIVE: 'activa',
  RESOLVED: 'resuelta',
  DISMISSED: 'descartada',
} as const;

export const DEFAULT_ALERT_THRESHOLD: number = parseFloat(
  process.env.ALERT_DEFAULT_THRESHOLD || '5.0'
);

export const PRODUCT_CATEGORIES: readonly string[] = [
  'ACCESORIOS',
  'BASES',
  'BOTELLAS',
  'BOTELLONES',
  'BIDONES',
  'TAPAS Y ASAS',
  'FRASCOS',
] as const;

export const PRODUCT_CATEGORY_SLUG_MAP: Record<string, string> = PRODUCT_CATEGORIES.reduce(
  (acc: Record<string, string>, category: string) => {
    const slug = category.toLowerCase().replace(/\s+/g, '_');
    acc[slug] = category;
    acc[slug.replace(/_/g, '-')] = category;
    return acc;
  },
  {}
);

export const PRODUCT_MATERIALS: readonly string[] = [
  'ACERO INOXIDABLE',
  'PET',
  'POLICARBONATO',
  'POLIETILENO',
  'POLIPROPILENO',
  'PVC',
  'OTRO',
] as const;

// Mapeo de categoría a código numérico (3 dígitos)
export const CATEGORY_CODE_MAP: Record<string, string> = {
  'ACCESORIOS': '001',
  'BASES': '002',
  'BOTELLAS': '003',
  'BOTELLONES': '004',
  'BIDONES': '005',
  'TAPAS Y ASAS': '006',
  'FRASCOS': '007',
};

// Mapeo de material a código numérico (3 dígitos)
export const MATERIAL_CODE_MAP: Record<string, string> = {
  'ACERO INOXIDABLE': '001',
  'PET': '002',
  'POLICARBONATO': '003',
  'POLIETILENO': '004',
  'POLIPROPILENO': '005',
  'PVC': '006',
  'OTRO': '007',
};

/**
 * Genera un código único para un producto basado en su categoría y material
 * Formato: PTXXXXXX donde los primeros 3 dígitos son la categoría y los últimos 3 el material
 * @param category - Categoría del producto
 * @param material - Material del producto
 * @param sequenceNumber - Número secuencial opcional para productos con misma categoría/material
 * @returns Código en formato PTXXXXXX
 */
export function generateProductCode(
  category: string,
  material: string,
  sequenceNumber?: number
): string {
  const categoryCode = CATEGORY_CODE_MAP[category] || '000';
  const materialCode = MATERIAL_CODE_MAP[material] || '000';
  
  if (sequenceNumber !== undefined) {
    // Si hay número secuencial, se usa en lugar del código de material
    const seqCode = sequenceNumber.toString().padStart(3, '0');
    return `PT${categoryCode}${seqCode}`;
  }
  
  return `PT${categoryCode}${materialCode}`;
}

