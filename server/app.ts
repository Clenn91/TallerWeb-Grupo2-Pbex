import express, { Express } from 'express';
import compression from 'compression';
import { securityHeaders, corsConfig, apiLimiter } from './middleware/security.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar rutas
import authRoutes from './routes/auth.js';
import qualityRoutes from './routes/quality.js';
import certificateRoutes from './routes/certificates.js';
import dashboardRoutes from './routes/dashboard.js';
import alertRoutes from './routes/alerts.js';
import nonConformityRoutes from './routes/nonConformities.js';
import productRoutes from './routes/products.js';
import userRoutes from './routes/users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

// Middlewares de seguridad
app.use(securityHeaders);
app.use(corsConfig);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Rate limiting
app.use('/api', apiLimiter);

// API Routes
const apiPrefix = process.env.API_PREFIX || '/api';
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/quality`, qualityRoutes);
app.use(`${apiPrefix}/certificates`, certificateRoutes);
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${apiPrefix}/alerts`, alertRoutes);
app.use(`${apiPrefix}/non-conformities`, nonConformityRoutes);
app.use(`${apiPrefix}/products`, productRoutes);
app.use(`${apiPrefix}/users`, userRoutes);

// Servir archivos estáticos (certificados PDF)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Servir imágenes de productos
app.use('/images/products', express.static(path.join(__dirname, 'scripts/images/products')));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

// Manejo de errores
app.use(notFound);
app.use(errorHandler);

export default app;

