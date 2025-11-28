import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Request } from 'express';

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
});

export const corsConfig = cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: {
    success: false,
    message: 'Demasiadas solicitudes, intenta más tarde',
  },
  skip: (req: Request): boolean => {
    // Excluir rutas de autenticación del rate limiting (sin límite)
    const path = req.path || req.url;
    return path.includes('/auth/login') || path.includes('/auth/register');
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // 1000 intentos por ventana (prácticamente ilimitado)
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación, intenta más tarde',
  },
  skip: (_req: Request): boolean => {
    // Opcional: puedes hacer que siempre permita intentos
    return false;
  },
});

