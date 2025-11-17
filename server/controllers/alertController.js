import { getAlerts, resolveAlert, dismissAlert } from '../services/alertService.js';

export const getAlertsController = async (req, res, next) => {
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

export const resolveAlertController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;
    const alert = await resolveAlert(id, req.user.id, resolutionNotes);

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

export const dismissAlertController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await dismissAlert(id, req.user.id);

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

