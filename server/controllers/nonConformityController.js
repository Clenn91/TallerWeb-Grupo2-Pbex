import {
  createNonConformity,
  getNonConformities,
  resolveNonConformity,
  updateNonConformityStatus,
} from '../services/nonConformityService.js';

export const createNonConformityController = async (req, res, next) => {
  try {
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

export const getNonConformitiesController = async (req, res, next) => {
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

export const resolveNonConformityController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { correctiveAction } = req.body;
    const nonConformity = await resolveNonConformity(id, req.user.id, correctiveAction);

    res.json({
      success: true,
      data: nonConformity,
    });
  } catch (error) {
    next(error);
  }
};

export const updateNonConformityStatusController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const nonConformity = await updateNonConformityStatus(id, status);

    res.json({
      success: true,
      data: nonConformity,
    });
  } catch (error) {
    next(error);
  }
};

