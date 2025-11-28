import sequelize, { testConnection } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const initDatabase = async (): Promise<void> => {
  try {
    console.log('Iniciando creación de tablas...\n');

    // Probar conexión
    const connected = await testConnection();
    if (!connected) {
      console.error('✗ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    // Sincronizar modelos (crear tablas)
    await sequelize.sync({ force: false, alter: false });
    console.log('✓ Tablas creadas/verificadas correctamente\n');

    console.log('✓ Base de datos inicializada correctamente');
    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('✗ Error al inicializar base de datos:', errorMessage);
    process.exit(1);
  }
};

initDatabase();

