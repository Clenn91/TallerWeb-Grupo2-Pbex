export const USER_ROLES = {
  ASSISTANT: 'asistente_calidad',
  SUPERVISOR: 'supervisor',
  ADMIN: 'administrador',
  MANAGEMENT: 'gerencia',
  VISITOR: 'visitante',
} as const;

export const DEFECT_TYPES = {
  MANCHA: 'mancha',
  REBABA: 'rebaba',
  INCOMPLETO: 'incompleto',
  DEFORMACION: 'deformacion',
  RAYON: 'rayon',
  OTRO: 'otro',
} as const;

export const SHIFTS = {
  MORNING: 'mañana',
  AFTERNOON: 'tarde',
  NIGHT: 'noche',
} as const;

export const CERTIFICATE_STATUS = {
  PENDING: 'pendiente',
  APPROVED: 'aprobado',
  REJECTED: 'rechazado',
} as const;

export const PRODUCT_CATEGORIES = [
  { value: 'ACCESORIOS', slug: 'accesorios' },
  { value: 'BASES', slug: 'bases' },
  { value: 'BOTELLAS', slug: 'botellas' },
  { value: 'BOTELLONES', slug: 'botellones' },
  { value: 'BIDONES', slug: 'bidones' },
  { value: 'TAPAS Y ASAS', slug: 'tapas_y_asas' },
  { value: 'FRASCOS', slug: 'frasco' },
] as const;

export const PRODUCT_CATEGORY_VALUE_BY_SLUG = PRODUCT_CATEGORIES.reduce(
  (acc, category) => {
    acc[category.slug] = category.value;
    return acc;
  },
  {} as Record<string, string>
);

export const PRODUCT_CATEGORY_SLUG_BY_VALUE = PRODUCT_CATEGORIES.reduce(
  (acc, category) => {
    acc[category.value] = category.slug;
    return acc;
  },
  {} as Record<string, string>
);

export const PRODUCT_CATEGORY_LABEL_BY_VALUE = PRODUCT_CATEGORIES.reduce(
  (acc, category) => {
    acc[category.value] = category.value;
    return acc;
  },
  {} as Record<string, string>
);

export const PRODUCT_MATERIALS = [
  'ACERO INOXIDABLE',
  'PET',
  'POLICARBONATO',
  'POLIETILENO',
  'POLIPROPILENO',
  'PVC',
  'OTRO',
] as const;

