// Tipos compartidos para el frontend

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'asistente_calidad' | 'supervisor' | 'administrador' | 'gerencia' | 'visitante';
  active: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  code: string;
  category: string;
  material: string;
  imageUrl: string | null;
  technicalSheet: string | null;
  active: boolean;
  alertThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionRecord {
  id: number;
  productId: number;
  userId: number;
  lotNumber: string;
  productionDate: string;
  shift: 'mañana' | 'tarde' | 'noche';
  productionLine: string;
  totalProduced: number;
  totalApproved: number;
  totalRejected: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  product?: Product;
  user?: User;
}

export interface QualityControl {
  id: number;
  productionRecordId: number;
  userId: number;
  weight: number | null;
  diameter: number | null;
  height: number | null;
  width: number | null;
  otherMeasurements: Record<string, any> | null;
  wastePercentage: number;
  approved: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  productionRecord?: ProductionRecord;
  user?: User;
  defects?: Defect[];
}

export interface Defect {
  id: number;
  qualityControlId: number;
  defectType: 'mancha' | 'rebaba' | 'incompleto' | 'deformacion' | 'rayon' | 'otro';
  quantity: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: number;
  code: string;
  productId: number;
  productionRecordId: number;
  qualityControlId: number | null;
  requestedBy: number;
  approvedBy: number | null;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  pdfPath: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  product?: Product;
  productionRecord?: ProductionRecord;
  qualityControl?: QualityControl;
  requester?: User;
  approver?: User;
}

export interface Alert {
  id: number;
  productId: number;
  productionRecordId: number | null;
  qualityControlId: number | null;
  resolvedBy: number | null;
  alertType: string;
  threshold: number;
  actualValue: number;
  status: 'activa' | 'resuelta' | 'descartada';
  emailSent: boolean;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  product?: Product;
  productionRecord?: ProductionRecord;
  qualityControl?: QualityControl;
  resolver?: User;
}

export interface NonConformity {
  id: number;
  code: string;
  productId: number | null;
  productionRecordId: number | null;
  reportedBy: number;
  resolvedBy: number | null;
  description: string;
  severity: 'baja' | 'media' | 'alta' | 'critica';
  status: 'abierta' | 'en_revision' | 'resuelta' | 'cerrada';
  correctiveAction: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  product?: Product;
  productionRecord?: ProductionRecord;
  reporter?: User;
  resolver?: User;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

