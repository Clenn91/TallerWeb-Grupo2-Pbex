import {
  createProductionRecord,
  createQualityControl,
  getQualityControls,
  getProductionRecords,
} from '../services/qualityService.js';

export const createProductionRecordController = async (req, res, next) => {
  try {
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

export const createQualityControlController = async (req, res, next) => {
  try {
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

export const getQualityControlsController = async (req, res, next) => {
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

export const getProductionRecordsController = async (req, res, next) => {
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

