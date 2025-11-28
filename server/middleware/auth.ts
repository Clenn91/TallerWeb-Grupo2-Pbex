import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import type { AuthRequest, UserRole } from '../types/index.js';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido',
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
      username: string;
      role: UserRole;
    };
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.active) {
      res.status(401).json({
        success: false,
        message: 'Usuario no válido o inactivo',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expirado',
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Error en autenticación',
    });
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción',
      });
      return;
    }

    next();
  };
};

// Middleware para validar qué roles puede crear un usuario
export const validateRoleCreation = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Usuario no autenticado',
    });
    return;
  }

  const { role: newUserRole } = req.body as { role?: UserRole };
  const currentUserRole = req.user.role;

  // Si no se está estableciendo un rol, permitir la operación
  if (!newUserRole) {
    next();
    return;
  }

  // Rechazar explícitamente la creación de usuarios visitantes
  if (newUserRole === 'visitante') {
    res.status(403).json({
      success: false,
      message: 'No se pueden crear usuarios con rol visitante. El acceso a productos es público y no requiere cuenta.',
    });
    return;
  }

  // Definir qué roles puede crear cada usuario
  const allowedRolesByUser: Record<string, UserRole[]> = {
    supervisor: ['asistente_calidad', 'supervisor', 'gerencia'],
    administrador: ['asistente_calidad', 'supervisor', 'gerencia', 'administrador'],
  };

  const allowedRoles = allowedRolesByUser[currentUserRole];

  if (!allowedRoles) {
    res.status(403).json({
      success: false,
      message: 'No tienes permisos para crear o modificar usuarios',
    });
    return;
  }

  if (!allowedRoles.includes(newUserRole)) {
    res.status(403).json({
      success: false,
      message: `No tienes permisos para crear usuarios con el rol "${newUserRole}". Solo puedes crear usuarios con roles: ${allowedRoles.join(', ')}`,
    });
    return;
  }

  next();
};

