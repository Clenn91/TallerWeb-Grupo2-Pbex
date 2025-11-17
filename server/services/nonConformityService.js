import { NonConformity, Product, ProductionRecord, User } from '../models/index.js';
import { Op } from 'sequelize';

const generateNonConformityCode = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `NC-${timestamp}-${random}`;
};

export const createNonConformity = async (nonConformityData) => {
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
    productId,
    productionRecordId,
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
  });
};

export const getNonConformities = async (filters = {}) => {
  const {
    status,
    severity,
    productId,
    page = 1,
    limit = 20,
  } = filters;

  const where = {};
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
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const resolveNonConformity = async (
  nonConformityId,
  resolvedBy,
  correctiveAction
) => {
  const nonConformity = await NonConformity.findByPk(nonConformityId);

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
  });
};

export const updateNonConformityStatus = async (nonConformityId, status) => {
  const nonConformity = await NonConformity.findByPk(nonConformityId);

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
  });
};

