import { Response, NextFunction } from "express";
import { login, register, getCurrentUser } from "../services/authService.js";
import type { AuthRequest } from "../types/index.js";

export const loginController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: "Username y password son requeridos",
      });
      return;
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

export const registerController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

export const getCurrentUserController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
      return;
    }
    const user = await getCurrentUser(req.user.id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
