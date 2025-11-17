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

export const PRODUCT_CATEGORIES = [
  { value: 'ACCESORIOS', slug: 'accesorios' },
  { value: 'BASES', slug: 'bases' },
  { value: 'BOTELLAS', slug: 'botellas' },
  { value: 'BOTELLONES', slug: 'botellones' },
  { value: 'BIDONES', slug: 'bidones' },
  { value: 'TAPAS Y ASAS', slug: 'tapas_y_asas' },
];

export const PRODUCT_CATEGORY_VALUE_BY_SLUG = PRODUCT_CATEGORIES.reduce(
  (acc, category) => {
    acc[category.slug] = category.value;
    return acc;
  },
  {}
);

export const PRODUCT_CATEGORY_SLUG_BY_VALUE = PRODUCT_CATEGORIES.reduce(
  (acc, category) => {
    acc[category.value] = category.slug;
    return acc;
  },
  {}
);

export const PRODUCT_CATEGORY_LABEL_BY_VALUE = PRODUCT_CATEGORIES.reduce(
  (acc, category) => {
    acc[category.value] = category.value;
    return acc;
  },
  {}
);

