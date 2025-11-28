// Tipos base para el sistema

export type UserRole = 
  | 'asistente_calidad'
  | 'supervisor'
  | 'administrador'
  | 'gerencia'
  | 'visitante';

export type DefectType = 
  | 'mancha'
  | 'rebaba'
  | 'incompleto'
  | 'deformacion'
  | 'rayon'
  | 'otro';

export type Shift = 'mañana' | 'tarde' | 'noche';

export type CertificateStatus = 'pendiente' | 'aprobado' | 'rechazado';

export type AlertStatus = 'activa' | 'resuelta' | 'descartada';

export type NonConformityStatus = 'abierta' | 'en_revision' | 'resuelta' | 'cerrada';

// Interfaces para Request/Response
import { Request } from 'express';

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Interfaces para servicios
export interface LoginResult {
  token: string;
  user: PublicUserData;
}

export interface PublicUserData {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  active: boolean;
  lastLogin: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AlertData {
  productName: string;
  lotNumber?: string;
  wastePercentage: number;
  threshold: number;
  date: Date;
}

export interface CertificateData {
  code: string;
  productName: string;
  lotNumber?: string;
  status: CertificateStatus;
  date: Date;
}

// Tipos para Sequelize
import { Model, Optional } from 'sequelize';

export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  active: boolean;
  lastLogin: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'active' | 'lastLogin' | 'createdAt' | 'updatedAt'> {}

export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {
  comparePassword(candidatePassword: string): Promise<boolean>;
  toPublicJSON(): PublicUserData;
}

export interface ProductAttributes {
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'description' | 'code' | 'imageUrl' | 'technicalSheet' | 'active' | 'alertThreshold' | 'createdAt' | 'updatedAt'> {}

export interface ProductInstance extends Model<ProductAttributes, ProductCreationAttributes>, ProductAttributes {}

export interface ProductionRecordAttributes {
  id: number;
  productId: number;
  userId: number;
  lotNumber: string;
  productionDate: Date;
  shift: Shift;
  productionLine: string;
  totalProduced: number;
  totalApproved: number;
  totalRejected: number;
  notes: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductionRecordCreationAttributes extends Optional<ProductionRecordAttributes, 'id' | 'notes' | 'createdAt' | 'updatedAt'> {}

export interface ProductionRecordInstance extends Model<ProductionRecordAttributes, ProductionRecordCreationAttributes>, ProductionRecordAttributes {}

export interface QualityControlAttributes {
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QualityControlCreationAttributes extends Optional<QualityControlAttributes, 'id' | 'weight' | 'diameter' | 'height' | 'width' | 'otherMeasurements' | 'wastePercentage' | 'approved' | 'notes' | 'createdAt' | 'updatedAt'> {}

export interface QualityControlInstance extends Model<QualityControlAttributes, QualityControlCreationAttributes>, QualityControlAttributes {}

export interface DefectAttributes {
  id: number;
  qualityControlId: number;
  defectType: DefectType;
  quantity: number;
  description: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DefectCreationAttributes extends Optional<DefectAttributes, 'id' | 'description' | 'createdAt' | 'updatedAt'> {}

export interface DefectInstance extends Model<DefectAttributes, DefectCreationAttributes>, DefectAttributes {}

export interface CertificateAttributes {
  id: number;
  code: string;
  productId: number;
  productionRecordId: number;
  qualityControlId: number | null;
  requestedBy: number;
  approvedBy: number | null;
  status: CertificateStatus;
  pdfPath: string | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CertificateCreationAttributes extends Optional<CertificateAttributes, 'id' | 'qualityControlId' | 'approvedBy' | 'status' | 'pdfPath' | 'approvedAt' | 'rejectionReason' | 'createdAt' | 'updatedAt'> {}

export interface CertificateInstance extends Model<CertificateAttributes, CertificateCreationAttributes>, CertificateAttributes {}

export interface AlertAttributes {
  id: number;
  productId: number;
  productionRecordId: number | null;
  qualityControlId: number | null;
  resolvedBy: number | null;
  alertType: string;
  threshold: number;
  actualValue: number;
  status: AlertStatus;
  emailSent: boolean;
  resolutionNotes: string | null;
  resolvedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AlertCreationAttributes extends Optional<AlertAttributes, 'id' | 'productionRecordId' | 'qualityControlId' | 'resolvedBy' | 'status' | 'emailSent' | 'resolutionNotes' | 'resolvedAt' | 'createdAt' | 'updatedAt'> {}

export interface AlertInstance extends Model<AlertAttributes, AlertCreationAttributes>, AlertAttributes {}

export interface NonConformityAttributes {
  id: number;
  code: string;
  productId: number | null;
  productionRecordId: number | null;
  reportedBy: number;
  resolvedBy: number | null;
  description: string;
  severity: string;
  status: NonConformityStatus;
  correctiveAction: string | null;
  resolvedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NonConformityCreationAttributes extends Optional<NonConformityAttributes, 'id' | 'code' | 'productId' | 'productionRecordId' | 'resolvedBy' | 'status' | 'correctiveAction' | 'resolvedAt' | 'createdAt' | 'updatedAt'> {}

export interface NonConformityInstance extends Model<NonConformityAttributes, NonConformityCreationAttributes>, NonConformityAttributes {}

// AuthRequest debe definirse después de UserInstance
export interface AuthRequest extends Request {
  user?: UserInstance;
}

