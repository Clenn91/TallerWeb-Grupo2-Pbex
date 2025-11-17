import { Alert, Product, ProductionRecord, QualityControl, User } from '../models/index.js';
import { Op } from 'sequelize';

export const getAlerts = async (filters = {}) => {
  const {
    status,
    productId,
    alertType,
    page = 1,
    limit = 20,
  } = filters;

  const where = {};
  if (status) where.status = status;
  if (productId) where.productId = productId;
  if (alertType) where.alertType = alertType;

  const offset = (page - 1) * limit;

  const { count, rows } = await Alert.findAndCountAll({
    where,
    include: [
      { model: Product, as: 'product' },
      { model: ProductionRecord, as: 'productionRecord' },
      { model: QualityControl, as: 'qualityControl' },
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

export const resolveAlert = async (alertId, resolvedBy, resolutionNotes) => {
  const alert = await Alert.findByPk(alertId);

  if (!alert) {
    throw new Error('Alerta no encontrada');
  }

  await alert.update({
    status: 'resuelta',
    resolvedBy,
    resolvedAt: new Date(),
    resolutionNotes,
  });

  return await Alert.findByPk(alertId, {
    include: [
      { model: Product, as: 'product' },
      { model: ProductionRecord, as: 'productionRecord' },
      { model: User, as: 'resolver' },
    ],
  });
};

export const dismissAlert = async (alertId, resolvedBy) => {
  const alert = await Alert.findByPk(alertId);

  if (!alert) {
    throw new Error('Alerta no encontrada');
  }

  await alert.update({
    status: 'descartada',
    resolvedBy,
    resolvedAt: new Date(),
  });

  return await Alert.findByPk(alertId, {
    include: [
      { model: Product, as: 'product' },
      { model: ProductionRecord, as: 'productionRecord' },
      { model: User, as: 'resolver' },
    ],
  });
};

