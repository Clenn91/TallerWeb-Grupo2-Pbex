import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no válido o inactivo',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error en autenticación',
    });
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción',
      });
    }

    next();
  };
};

// Middleware para validar qué roles puede crear un usuario
export const validateRoleCreation = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado',
    });
  }

  const { role: newUserRole } = req.body;
  const currentUserRole = req.user.role;

  // Si no se está estableciendo un rol, permitir la operación
  if (!newUserRole) {
    return next();
  }

  // Rechazar explícitamente la creación de usuarios visitantes
  if (newUserRole === 'visitante') {
    return res.status(403).json({
      success: false,
      message: 'No se pueden crear usuarios con rol visitante. El acceso a productos es público y no requiere cuenta.',
    });
  }

  // Definir qué roles puede crear cada usuario
  const allowedRolesByUser = {
    supervisor: ['asistente_calidad', 'supervisor', 'gerencia'],
    administrador: ['asistente_calidad', 'supervisor', 'gerencia', 'administrador'],
  };

  const allowedRoles = allowedRolesByUser[currentUserRole];

  if (!allowedRoles) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para crear o modificar usuarios',
    });
  }

  if (!allowedRoles.includes(newUserRole)) {
    return res.status(403).json({
      success: false,
      message: `No tienes permisos para crear usuarios con el rol "${newUserRole}". Solo puedes crear usuarios con roles: ${allowedRoles.join(', ')}`,
    });
  }

  next();
};

