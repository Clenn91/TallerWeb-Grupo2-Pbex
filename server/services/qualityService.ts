import {
  ProductionRecord,
  QualityControl,
  Defect,
  Product,
  Alert,
  User,
} from '../models/index.js';
import { Op } from 'sequelize';
import { sendAlertEmail, isEmailEnabled } from '../config/email.js';
import { DEFAULT_ALERT_THRESHOLD } from '../config/constants.js';
import type {
  PaginationResult,
  ProductionRecordInstance,
  QualityControlInstance,
} from '../types/index.js';

import type { Shift } from '../types/index.js';

interface ProductionRecordData {
  productId: number;
  userId: number;
  lotNumber: string;
  productionDate: Date;
  shift: Shift;
  productionLine: string;
  totalProduced: number;
  totalApproved: number;
  totalRejected: number;
  notes?: string | null;
}

interface QualityControlData {
  productionRecordId: number;
  userId: number;
  weight?: number | null;
  diameter?: number | null;
  height?: number | null;
  width?: number | null;
  otherMeasurements?: Record<string, any> | null;
  approved?: boolean;
  notes?: string | null;
  defects?: Array<{
    defectType: string;
    quantity: number;
    description?: string | null;
  }>;
}

interface QualityControlFilters {
  productId?: number;
  productionRecordId?: number;
  startDate?: string;
  endDate?: string;
  shift?: string;
  page?: number;
  limit?: number;
}

interface ProductionRecordFilters {
  productId?: number;
  userId?: number;
  startDate?: string;
  endDate?: string;
  shift?: string;
  lotNumber?: string;
  hasQualityControl?: boolean;
  page?: number;
  limit?: number;
}

export const createProductionRecord = async (
  recordData: ProductionRecordData
): Promise<ProductionRecordInstance> => {
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

  // Validar que totalApproved + totalRejected <= totalProduced
  if (totalApproved + totalRejected > totalProduced) {
    throw new Error(
      `La suma de aprobados (${totalApproved}) y rechazados (${totalRejected}) no puede ser mayor que el total producido (${totalProduced})`
    );
  }

  // Validar que los valores sean positivos
  if (totalProduced <= 0) {
    throw new Error('El total producido debe ser mayor a 0');
  }

  if (totalApproved < 0 || totalRejected < 0) {
    throw new Error('Los valores de aprobados y rechazados no pueden ser negativos');
  }

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
      { model: User, as: 'user' },
    ],
  }) as ProductionRecordInstance;
};

export const createQualityControl = async (
  controlData: QualityControlData
): Promise<QualityControlInstance> => {
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

  // Validar que el registro de producción existe
  const productionRecord = await ProductionRecord.findByPk(productionRecordId);
  if (!productionRecord) {
    throw new Error('Registro de producción no encontrado');
  }

  // Validar que no exista ya un control de calidad para este registro
  const existingControl = await QualityControl.findOne({
    where: { productionRecordId },
  });

  if (existingControl) {
    throw new Error('Ya existe un control de calidad para este registro de producción. Cada registro solo puede tener un control de calidad.');
  }

  // Calcular porcentaje de merma
  const totalDefects = defects?.reduce((sum, d) => sum + (d.quantity || 0), 0) || 0;
  const totalProduced = productionRecord.totalProduced || 1;
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
    wastePercentage: parseFloat(String(wastePercentage)),
    approved: approved ?? true,
    notes,
  });

  // Crear defectos asociados
  if (defects && defects.length > 0) {
    await Promise.all(
      defects.map((defect) =>
        Defect.create({
          qualityControlId: qualityControl.id,
          defectType: defect.defectType as any,
          quantity: defect.quantity,
          description: defect.description,
        })
      )
    );
  }

  // Verificar si se debe generar alerta
  const product = await Product.findByPk(productionRecord!.productId);
  const threshold = product?.alertThreshold || DEFAULT_ALERT_THRESHOLD;

  const wastePercentageNum = parseFloat(String(wastePercentage));
  if (wastePercentageNum > threshold) {
    // Crear alerta
    const alert = await Alert.create({
      productId: productionRecord!.productId,
      productionRecordId,
      qualityControlId: qualityControl.id,
      alertType: 'waste_threshold',
      threshold,
      actualValue: wastePercentageNum,
      status: 'activa',
    });

    // Enviar email si está configurado
    if (isEmailEnabled) {
      const supervisors = await User.findAll({
        where: {
          role: { [Op.in]: ['supervisor', 'administrador'] },
          active: true,
        },
      });

      for (const supervisor of supervisors) {
        await sendAlertEmail(supervisor.email, {
          productName: product!.name,
          lotNumber: productionRecord!.lotNumber,
          wastePercentage: wastePercentageNum,
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
      { model: User, as: 'user' },
      { model: Defect, as: 'defects' },
    ],
  }) as QualityControlInstance;
};

export const getQualityControls = async (
  filters: QualityControlFilters = {}
): Promise<PaginationResult<QualityControlInstance>> => {
  const {
    productId,
    productionRecordId,
    startDate,
    endDate,
    shift,
    page = 1,
    limit = 20,
  } = filters;

  const where: any = {};
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
      { model: User, as: 'user' },
      { model: Defect, as: 'defects' },
    ],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    data: rows as QualityControlInstance[],
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const getProductionRecords = async (
  filters: ProductionRecordFilters = {}
): Promise<PaginationResult<ProductionRecordInstance>> => {
  const {
    productId,
    userId,
    startDate,
    endDate,
    shift,
    lotNumber,
    hasQualityControl,
    page = 1,
    limit = 20,
  } = filters;

  const where: any = {};
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

  const includeOptions: any[] = [
    { model: Product, as: 'product' },
    { model: User, as: 'user' },
  ];

  // Si se requiere que tenga control de calidad, incluir la relación
  if (hasQualityControl) {
    includeOptions.push({
      model: QualityControl,
      as: 'qualityControls',
      required: true, // INNER JOIN - solo registros con control de calidad
    });
  }

  const { count, rows } = await ProductionRecord.findAndCountAll({
    where,
    include: includeOptions,
    distinct: true, // Importante cuando hay múltiples relaciones
    limit,
    offset,
    order: [['productionDate', 'DESC'], ['createdAt', 'DESC']],
  });

  return {
    data: rows as ProductionRecordInstance[],
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

