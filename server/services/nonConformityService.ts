import { NonConformity, Product, ProductionRecord, User } from '../models/index.js';
import type {
  NonConformityInstance,
  NonConformityStatus,
  PaginationResult,
} from '../types/index.js';

const generateNonConformityCode = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `NC-${timestamp}-${random}`;
};

interface NonConformityData {
  productId?: number | null;
  productionRecordId?: number | null;
  reportedBy: number;
  description: string;
  severity?: 'baja' | 'media' | 'alta' | 'critica';
}

interface NonConformityFilters {
  status?: NonConformityStatus;
  severity?: string;
  productId?: number;
  page?: number;
  limit?: number;
}

export const createNonConformity = async (
  nonConformityData: NonConformityData
): Promise<NonConformityInstance> => {
  const {
    productId,
    productionRecordId,
    reportedBy,
    description,
    severity,
  } = nonConformityData;

  const code = generateNonConformityCode();

  const nonConformity = await NonConformity.create({
    code,
    productId: productId ?? null,
    productionRecordId: productionRecordId ?? null,
    reportedBy,
    description,
    severity: severity || 'media',
    status: 'abierta',
  });

  return await NonConformity.findByPk(nonConformity.id, {
    include: [
      { model: Product, as: 'product' },
      { model: ProductionRecord, as: 'productionRecord' },
      { model: User, as: 'reporter' },
    ],
  }) as NonConformityInstance;
};

export const getNonConformities = async (
  filters: NonConformityFilters = {}
): Promise<PaginationResult<NonConformityInstance>> => {
  const {
    status,
    severity,
    productId,
    page = 1,
    limit = 20,
  } = filters;

  const where: any = {};
  if (status) where.status = status;
  if (severity) where.severity = severity;
  if (productId) where.productId = productId;

  const offset = (page - 1) * limit;

  const { count, rows } = await NonConformity.findAndCountAll({
    where,
    include: [
      { model: Product, as: 'product' },
      { model: ProductionRecord, as: 'productionRecord' },
      { model: User, as: 'reporter' },
      { model: User, as: 'resolver' },
    ],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    data: rows as NonConformityInstance[],
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const resolveNonConformity = async (
  nonConformityId: number,
  resolvedBy: number,
  correctiveAction: string
): Promise<NonConformityInstance> => {
  const nonConformity = await NonConformity.findByPk(nonConformityId) as NonConformityInstance | null;

  if (!nonConformity) {
    throw new Error('No conformidad no encontrada');
  }

  await nonConformity.update({
    status: 'resuelta',
    resolvedBy,
    resolvedAt: new Date(),
    correctiveAction,
  });

  return await NonConformity.findByPk(nonConformityId, {
    include: [
      { model: Product, as: 'product' },
      { model: ProductionRecord, as: 'productionRecord' },
      { model: User, as: 'reporter' },
      { model: User, as: 'resolver' },
    ],
  }) as NonConformityInstance;
};

export const updateNonConformityStatus = async (
  nonConformityId: number,
  status: NonConformityStatus
): Promise<NonConformityInstance> => {
  const nonConformity = await NonConformity.findByPk(nonConformityId) as NonConformityInstance | null;

  if (!nonConformity) {
    throw new Error('No conformidad no encontrada');
  }

  await nonConformity.update({ status });

  return await NonConformity.findByPk(nonConformityId, {
    include: [
      { model: Product, as: 'product' },
      { model: ProductionRecord, as: 'productionRecord' },
      { model: User, as: 'reporter' },
      { model: User, as: 'resolver' },
    ],
  }) as NonConformityInstance;
};

