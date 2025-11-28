import dotenv from 'dotenv';
import app from './app.js';
import { testConnection } from './config/database.js';
import { sequelize } from './models/index.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Probar conexión a la base de datos
testConnection().then((connected) => {
  if (!connected) {
    console.error('✗ No se pudo conectar a la base de datos. Verifica tu configuración.');
    process.exit(1);
  }

  // Sincronizar modelos (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    sequelize
      .sync({ alter: false })
      .then(() => {
        console.log('✓ Modelos sincronizados');
      })
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error('✗ Error al sincronizar modelos:', errorMessage);
      });
  }

  // Iniciar servidor
  app.listen(PORT, () => {
    console.log(`\n✓ Servidor corriendo en puerto ${PORT}`);
    console.log(`✓ Modo: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ API disponible en: http://localhost:${PORT}${process.env.API_PREFIX || '/api'}\n`);
  });
});

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
  console.error('✗ Error no manejado:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  sequelize.close();
  process.exit(0);
});

