import { getDashboardMetrics, getProductionTrends } from '../services/dashboardService.js';

export const getDashboardMetricsController = async (req, res, next) => {
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

export const getProductionTrendsController = async (req, res, next) => {
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

