import { Response, NextFunction } from 'express';
import {
  createProductionRecord,
  createQualityControl,
  getQualityControls,
  getProductionRecords,
} from '../services/qualityService.js';
import type { AuthRequest } from '../types/index.js';

export const createProductionRecordController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
      return;
    }
    const recordData = {
      ...req.body,
      userId: req.user.id,
    };
    const record = await createProductionRecord(recordData);

    res.status(201).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

export const createQualityControlController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
      return;
    }
    const controlData = {
      ...req.body,
      userId: req.user.id,
    };
    const control = await createQualityControl(controlData);

    res.status(201).json({
      success: true,
      data: control,
    });
  } catch (error) {
    next(error);
  }
};

export const getQualityControlsController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = req.query;
    const result = await getQualityControls(filters);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductionRecordsController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = req.query;
    const result = await getProductionRecords(filters);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

