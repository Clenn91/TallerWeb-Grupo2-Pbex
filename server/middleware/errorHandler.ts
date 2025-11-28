import { Request, Response, NextFunction } from 'express';
import { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize';

export const errorHandler = (
  err: Error | ValidationError | UniqueConstraintError | ForeignKeyConstraintError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  // Errores de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    const validationError = err as ValidationError;
    res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: validationError.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
    return;
  }

  // Errores de restricción única
  if (err.name === 'SequelizeUniqueConstraintError') {
    const uniqueError = err as UniqueConstraintError;
    res.status(409).json({
      success: false,
      message: 'El recurso ya existe',
      field: uniqueError.errors[0]?.path,
    });
    return;
  }

  // Errores de foreign key
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    res.status(400).json({
      success: false,
      message: 'Referencia inválida',
    });
    return;
  }

  // Error por defecto
  const statusCode = (err as any).statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
};

