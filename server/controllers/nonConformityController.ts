import { Response, NextFunction } from 'express';
import {
  createNonConformity,
  getNonConformities,
  resolveNonConformity,
  updateNonConformityStatus,
} from '../services/nonConformityService.js';
import type { AuthRequest, NonConformityStatus } from '../types/index.js';

export const createNonConformityController = async (
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
    const nonConformityData = {
      ...req.body,
      reportedBy: req.user.id,
    };
    const nonConformity = await createNonConformity(nonConformityData);

    res.status(201).json({
      success: true,
      data: nonConformity,
    });
  } catch (error) {
    next(error);
  }
};

export const getNonConformitiesController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = req.query;
    const result = await getNonConformities(filters);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const resolveNonConformityController = async (
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
    const { correctiveAction } = req.body as { correctiveAction?: string };
    const nonConformity = await resolveNonConformity(
      parseInt(id, 10),
      req.user.id,
      correctiveAction || ''
    );

    res.json({
      success: true,
      data: nonConformity,
    });
  } catch (error) {
    next(error);
  }
};

export const updateNonConformityStatusController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status?: NonConformityStatus };
    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Estado requerido',
      });
      return;
    }
    const nonConformity = await updateNonConformityStatus(
      parseInt(id, 10),
      status
    );

    res.json({
      success: true,
      data: nonConformity,
    });
  } catch (error) {
    next(error);
  }
};

