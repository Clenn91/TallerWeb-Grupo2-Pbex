import { Response, NextFunction } from 'express';
import { getAlerts, resolveAlert, dismissAlert } from '../services/alertService.js';
import type { AuthRequest } from '../types/index.js';

export const getAlertsController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = req.query;
    const result = await getAlerts(filters);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const resolveAlertController = async (
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
    const { id } = req.params;
    const { resolutionNotes } = req.body as { resolutionNotes?: string };
    const alert = await resolveAlert(
      parseInt(id, 10),
      req.user.id,
      resolutionNotes || ''
    );

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

export const dismissAlertController = async (
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
    const { id } = req.params;
    const alert = await dismissAlert(parseInt(id, 10), req.user.id);

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

