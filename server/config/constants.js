// Constantes del sistema

export const USER_ROLES = {
  ASSISTANT: 'asistente_calidad',
  SUPERVISOR: 'supervisor',
  ADMIN: 'administrador',
  MANAGEMENT: 'gerencia',
  VISITOR: 'visitante',
};

export const DEFECT_TYPES = {
  MANCHA: 'mancha',
  REBABA: 'rebaba',
  INCOMPLETO: 'incompleto',
  DEFORMACION: 'deformacion',
  RAYON: 'rayon',
  OTRO: 'otro',
};

export const SHIFTS = {
  MORNING: 'mañana',
  AFTERNOON: 'tarde',
  NIGHT: 'noche',
};

export const CERTIFICATE_STATUS = {
  PENDING: 'pendiente',
  APPROVED: 'aprobado',
  REJECTED: 'rechazado',
};

export const ALERT_STATUS = {
  ACTIVE: 'activa',
  RESOLVED: 'resuelta',
  DISMISSED: 'descartada',
};

export const DEFAULT_ALERT_THRESHOLD = parseFloat(
  process.env.ALERT_DEFAULT_THRESHOLD || '5.0'
);

export const PRODUCT_CATEGORIES = [
  'ACCESORIOS',
  'BASES',
  'BOTELLAS',
  'BOTELLONES',
  'BIDONES',
  'TAPAS Y ASAS',
];

export const PRODUCT_CATEGORY_SLUG_MAP = PRODUCT_CATEGORIES.reduce(
  (acc, category) => {
    const slug = category.toLowerCase().replace(/\s+/g, '_');
    acc[slug] = category;
    acc[slug.replace(/_/g, '-')] = category;
    return acc;
  },
  {}
);

