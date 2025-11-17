import {
  ProductionRecord,
  QualityControl,
  Defect,
  Product,
  Alert,
  Certificate,
  NonConformity,
} from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

export const getDashboardMetrics = async (filters = {}) => {
  const { startDate, endDate, productId } = filters;

  const whereClause = {};
  if (startDate || endDate) {
    whereClause.productionDate = {
      ...(startDate && { [Op.gte]: startDate }),
      ...(endDate && { [Op.lte]: endDate }),
    };
  }
  if (productId) {
    whereClause.productId = productId;
  }

  // Métricas de producción
  const productionStats = await ProductionRecord.findAll({
    where: whereClause,
    attributes: [
      [sequelize.fn('SUM', sequelize.col('total_produced')), 'totalProduced'],
      [sequelize.fn('SUM', sequelize.col('total_approved')), 'totalApproved'],
      [sequelize.fn('SUM', sequelize.col('total_rejected')), 'totalRejected'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalRecords'],
    ],
    raw: true,
  });

  // Métricas de calidad
  const qualityStats = await QualityControl.findAll({
    include: [
      {
        model: ProductionRecord,
        as: 'productionRecord',
        where: whereClause,
        required: true,
      },
    ],
    attributes: [
      [sequelize.fn('AVG', sequelize.col('waste_percentage')), 'avgWastePercentage'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalControls'],
      [
        sequelize.fn(
          'COUNT',
          sequelize.literal("CASE WHEN approved = true THEN 1 END")
        ),
        'approvedControls',
      ],
    ],
    raw: true,
  });

  // Total de defectos por tipo
  const defectsByType = await Defect.findAll({
    include: [
      {
        model: QualityControl,
        as: 'qualityControl',
        include: [
          {
            model: ProductionRecord,
            as: 'productionRecord',
            where: whereClause,
            required: true,
          },
        ],
        required: true,
      },
    ],
    attributes: [
      'defectType',
      [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
    ],
    group: ['defectType'],
    raw: true,
  });

  // Alertas activas
  const activeAlerts = await Alert.count({
    where: {
      status: 'activa',
      ...(productId && { productId }),
    },
  });

  // Certificados pendientes
  const pendingCertificates = await Certificate.count({
    where: {
      status: 'pendiente',
    },
  });

  // No conformidades abiertas
  const openNonConformities = await NonConformity.count({
    where: {
      status: { [Op.in]: ['abierta', 'en_revision'] },
    },
  });

  // Producción por turno
  const productionByShift = await ProductionRecord.findAll({
    where: whereClause,
    attributes: [
      'shift',
      [sequelize.fn('SUM', sequelize.col('total_produced')), 'totalProduced'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalRecords'],
    ],
    group: ['shift'],
    raw: true,
  });

  // Producción por producto
  const productionByProduct = await ProductionRecord.findAll({
    where: whereClause,
    include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }],
    attributes: [
      'productId',
      [sequelize.fn('SUM', sequelize.col('total_produced')), 'totalProduced'],
      [sequelize.fn('SUM', sequelize.col('total_approved')), 'totalApproved'],
      [sequelize.fn('SUM', sequelize.col('total_rejected')), 'totalRejected'],
    ],
    group: ['productId', 'product.id', 'product.name'],
    raw: false,
  });

  const productionData = productionStats[0] || {};
  const qualityData = qualityStats[0] || {};

  return {
    production: {
      totalProduced: parseInt(productionData.totalProduced || 0),
      totalApproved: parseInt(productionData.totalApproved || 0),
      totalRejected: parseInt(productionData.totalRejected || 0),
      totalRecords: parseInt(productionData.totalRecords || 0),
      approvalRate:
        productionData.totalProduced > 0
          ? (
              (productionData.totalApproved / productionData.totalProduced) *
              100
            ).toFixed(2)
          : 0,
    },
    quality: {
      avgWastePercentage: parseFloat(qualityData.avgWastePercentage || 0).toFixed(2),
      totalControls: parseInt(qualityData.totalControls || 0),
      approvedControls: parseInt(qualityData.approvedControls || 0),
      approvalRate:
        qualityData.totalControls > 0
          ? (
              (qualityData.approvedControls / qualityData.totalControls) *
              100
            ).toFixed(2)
          : 0,
    },
    defects: defectsByType.map((d) => ({
      type: d.defectType,
      quantity: parseInt(d.totalQuantity || 0),
    })),
    alerts: {
      active: activeAlerts,
    },
    certificates: {
      pending: pendingCertificates,
    },
    nonConformities: {
      open: openNonConformities,
    },
    productionByShift: productionByShift.map((p) => ({
      shift: p.shift,
      totalProduced: parseInt(p.totalProduced || 0),
      totalRecords: parseInt(p.totalRecords || 0),
    })),
    productionByProduct: productionByProduct.map((p) => ({
      productId: p.productId,
      productName: p.product?.name || 'N/A',
      totalProduced: parseInt(p.dataValues.totalProduced || 0),
      totalApproved: parseInt(p.dataValues.totalApproved || 0),
      totalRejected: parseInt(p.dataValues.totalRejected || 0),
    })),
  };
};

export const getProductionTrends = async (filters = {}) => {
  const { startDate, endDate, productId, groupBy = 'day' } = filters;

  const whereClause = {};
  if (startDate || endDate) {
    whereClause.productionDate = {
      ...(startDate && { [Op.gte]: startDate }),
      ...(endDate && { [Op.lte]: endDate }),
    };
  }
  if (productId) {
    whereClause.productId = productId;
  }

  let dateFormat;
  if (groupBy === 'day') {
    dateFormat = sequelize.fn('DATE', sequelize.col('production_date'));
  } else if (groupBy === 'week') {
    dateFormat = sequelize.fn('DATE_TRUNC', 'week', sequelize.col('production_date'));
  } else if (groupBy === 'month') {
    dateFormat = sequelize.fn('DATE_TRUNC', 'month', sequelize.col('production_date'));
  } else {
    dateFormat = sequelize.fn('DATE', sequelize.col('production_date'));
  }

  const trends = await ProductionRecord.findAll({
    where: whereClause,
    attributes: [
      [dateFormat, 'date'],
      [sequelize.fn('SUM', sequelize.col('total_produced')), 'totalProduced'],
      [sequelize.fn('SUM', sequelize.col('total_approved')), 'totalApproved'],
      [sequelize.fn('SUM', sequelize.col('total_rejected')), 'totalRejected'],
    ],
    group: [sequelize.literal('date')],
    order: [[sequelize.literal('date'), 'ASC']],
    raw: true,
  });

  return trends.map((t) => ({
    date: t.date,
    totalProduced: parseInt(t.totalProduced || 0),
    totalApproved: parseInt(t.totalApproved || 0),
    totalRejected: parseInt(t.totalRejected || 0),
  }));
};

