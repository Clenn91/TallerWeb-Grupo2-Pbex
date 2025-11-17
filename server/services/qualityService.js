import {
  ProductionRecord,
  QualityControl,
  Defect,
  Product,
  Alert,
} from '../models/index.js';
import { Op } from 'sequelize';
import { sendAlertEmail, isEmailEnabled } from '../config/email.js';
import { DEFAULT_ALERT_THRESHOLD } from '../config/constants.js';

export const createProductionRecord = async (recordData) => {
  const {
    productId,
    userId,
    lotNumber,
    productionDate,
    shift,
    productionLine,
    totalProduced,
    totalApproved,
    totalRejected,
    notes,
  } = recordData;

  const record = await ProductionRecord.create({
    productId,
    userId,
    lotNumber,
    productionDate,
    shift,
    productionLine,
    totalProduced,
    totalApproved,
    totalRejected,
    notes,
  });

  return await ProductionRecord.findByPk(record.id, {
    include: [
      { model: Product, as: 'product' },
      { model: require('../models/User.js').default, as: 'user' },
    ],
  });
};

export const createQualityControl = async (controlData) => {
  const {
    productionRecordId,
    userId,
    weight,
    diameter,
    height,
    width,
    otherMeasurements,
    approved,
    notes,
    defects,
  } = controlData;

  // Calcular porcentaje de merma
  const totalDefects = defects?.reduce((sum, d) => sum + (d.quantity || 0), 0) || 0;
  const productionRecord = await ProductionRecord.findByPk(productionRecordId);
  const totalProduced = productionRecord?.totalProduced || 1;
  const wastePercentage = totalProduced > 0
    ? ((totalDefects / totalProduced) * 100).toFixed(2)
    : 0;

  // Crear control de calidad
  const qualityControl = await QualityControl.create({
    productionRecordId,
    userId,
    weight,
    diameter,
    height,
    width,
    otherMeasurements,
    wastePercentage: parseFloat(wastePercentage),
    approved,
    notes,
  });

  // Crear defectos asociados
  if (defects && defects.length > 0) {
    await Promise.all(
      defects.map((defect) =>
        Defect.create({
          qualityControlId: qualityControl.id,
          defectType: defect.defectType,
          quantity: defect.quantity,
          description: defect.description,
        })
      )
    );
  }

  // Verificar si se debe generar alerta
  const product = await Product.findByPk(productionRecord.productId);
  const threshold = product?.alertThreshold || DEFAULT_ALERT_THRESHOLD;

  if (parseFloat(wastePercentage) > threshold) {
    // Crear alerta
    const alert = await Alert.create({
      productId: productionRecord.productId,
      productionRecordId,
      qualityControlId: qualityControl.id,
      alertType: 'waste_threshold',
      threshold,
      actualValue: parseFloat(wastePercentage),
      status: 'activa',
    });

    // Enviar email si está configurado
    if (isEmailEnabled) {
      const supervisors = await require('../models/User.js').default.findAll({
        where: {
          role: { [Op.in]: ['supervisor', 'administrador'] },
          active: true,
        },
      });

      for (const supervisor of supervisors) {
        await sendAlertEmail(supervisor.email, {
          productName: product.name,
          lotNumber: productionRecord.lotNumber,
          wastePercentage: parseFloat(wastePercentage),
          threshold,
          date: new Date(),
        });
      }

      await alert.update({ emailSent: true });
    }
  }

  return await QualityControl.findByPk(qualityControl.id, {
    include: [
      { model: ProductionRecord, as: 'productionRecord' },
      { model: require('../models/User.js').default, as: 'user' },
      { model: Defect, as: 'defects' },
    ],
  });
};

export const getQualityControls = async (filters = {}) => {
  const {
    productId,
    productionRecordId,
    startDate,
    endDate,
    shift,
    page = 1,
    limit = 20,
  } = filters;

  const where = {};
  if (productId) where.productId = productId;
  if (productionRecordId) where.productionRecordId = productionRecordId;
  if (shift) where.shift = shift;

  const offset = (page - 1) * limit;

  const { count, rows } = await QualityControl.findAndCountAll({
    where,
    include: [
      {
        model: ProductionRecord,
        as: 'productionRecord',
        where: startDate || endDate
          ? {
              productionDate: {
                ...(startDate && { [Op.gte]: startDate }),
                ...(endDate && { [Op.lte]: endDate }),
              },
            }
          : {},
        include: [{ model: Product, as: 'product' }],
      },
      { model: require('../models/User.js').default, as: 'user' },
      { model: Defect, as: 'defects' },
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

export const getProductionRecords = async (filters = {}) => {
  const {
    productId,
    userId,
    startDate,
    endDate,
    shift,
    lotNumber,
    page = 1,
    limit = 20,
  } = filters;

  const where = {};
  if (productId) where.productId = productId;
  if (userId) where.userId = userId;
  if (shift) where.shift = shift;
  if (lotNumber) where.lotNumber = { [Op.like]: `%${lotNumber}%` };

  if (startDate || endDate) {
    where.productionDate = {
      ...(startDate && { [Op.gte]: startDate }),
      ...(endDate && { [Op.lte]: endDate }),
    };
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await ProductionRecord.findAndCountAll({
    where,
    include: [
      { model: Product, as: 'product' },
      { model: require('../models/User.js').default, as: 'user' },
    ],
    limit,
    offset,
    order: [['productionDate', 'DESC'], ['createdAt', 'DESC']],
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

