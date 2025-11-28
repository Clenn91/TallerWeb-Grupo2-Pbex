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

interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  productId?: number;
}

interface TrendFilters extends DashboardFilters {
  groupBy?: 'day' | 'week' | 'month';
}

interface DashboardMetrics {
  production: {
    totalProduced: number;
    totalApproved: number;
    totalRejected: number;
    totalRecords: number;
    approvalRate: string;
  };
  quality: {
    avgWastePercentage: string;
    totalControls: number;
    approvedControls: number;
    approvalRate: string;
  };
  defects: Array<{
    type: string;
    quantity: number;
  }>;
  alerts: {
    active: number;
  };
  certificates: {
    pending: number;
  };
  nonConformities: {
    open: number;
  };
  productionByShift: Array<{
    shift: string;
    totalProduced: number;
    totalRecords: number;
  }>;
  productionByProduct: Array<{
    productId: number;
    productName: string;
    totalProduced: number;
    totalApproved: number;
    totalRejected: number;
  }>;
}

interface ProductionTrend {
  date: string | Date;
  totalProduced: number;
  totalApproved: number;
  totalRejected: number;
}

export const getDashboardMetrics = async (
  filters: DashboardFilters = {}
): Promise<DashboardMetrics> => {
  const { startDate, endDate, productId } = filters;

  const whereClause: any = {};
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
  }) as any[];

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
  }) as any[];

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
  }) as any[];

  const productionData = productionStats[0] as any || {};
  const qualityData = qualityStats[0] as any || {};

  return {
    production: {
      totalProduced: parseInt(productionData.totalProduced || '0', 10),
      totalApproved: parseInt(productionData.totalApproved || '0', 10),
      totalRejected: parseInt(productionData.totalRejected || '0', 10),
      totalRecords: parseInt(productionData.totalRecords || '0', 10),
      approvalRate:
        productionData.totalProduced > 0
          ? (
              (productionData.totalApproved / productionData.totalProduced) *
              100
            ).toFixed(2)
          : '0',
    },
    quality: {
      avgWastePercentage: parseFloat(qualityData.avgWastePercentage || '0').toFixed(2),
      totalControls: parseInt(qualityData.totalControls || '0', 10),
      approvedControls: parseInt(qualityData.approvedControls || '0', 10),
      approvalRate:
        qualityData.totalControls > 0
          ? (
              (qualityData.approvedControls / qualityData.totalControls) *
              100
            ).toFixed(2)
          : '0',
    },
    defects: defectsByType.map((d: any) => ({
      type: d.defectType,
      quantity: parseInt(d.totalQuantity || '0', 10),
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
    productionByShift: productionByShift.map((p: any) => ({
      shift: p.shift,
      totalProduced: parseInt(p.totalProduced || '0', 10),
      totalRecords: parseInt(p.totalRecords || '0', 10),
    })),
    productionByProduct: productionByProduct.map((p: any) => ({
      productId: p.productId,
      productName: ((p as any).product as typeof Product)?.name || 'N/A',
      totalProduced: parseInt((p as any).dataValues?.totalProduced || '0', 10),
      totalApproved: parseInt((p as any).dataValues?.totalApproved || '0', 10),
      totalRejected: parseInt((p as any).dataValues?.totalRejected || '0', 10),
    })),
  };
};

export const getProductionTrends = async (
  filters: TrendFilters = {}
): Promise<ProductionTrend[]> => {
  const { startDate, endDate, productId, groupBy = 'day' } = filters;

  const whereClause: any = {};
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
    group: [sequelize.literal('date') as any],
    order: [[sequelize.literal('date'), 'ASC']],
    raw: true,
  }) as any[];

  return trends.map((t: any) => ({
    date: t.date,
    totalProduced: parseInt(t.totalProduced || '0', 10),
    totalApproved: parseInt(t.totalApproved || '0', 10),
    totalRejected: parseInt(t.totalRejected || '0', 10),
  }));
};

