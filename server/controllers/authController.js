import { login, register, getCurrentUser } from '../services/authService.js';

export const loginController = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username y password son requeridos',
      });
    }

    const result = await login(username, password);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const registerController = async (req, res, next) => {
  try {
    const userData = req.body;
    const user = await register(userData);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUserController = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user.id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

