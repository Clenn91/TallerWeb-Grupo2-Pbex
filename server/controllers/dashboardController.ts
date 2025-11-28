import { Response, NextFunction } from 'express';
import { getDashboardMetrics, getProductionTrends } from '../services/dashboardService.js';
import type { AuthRequest } from '../types/index.js';

export const getDashboardMetricsController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = req.query;
    const metrics = await getDashboardMetrics(filters);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductionTrendsController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = req.query;
    const trends = await getProductionTrends(filters);

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    next(error);
  }
};

