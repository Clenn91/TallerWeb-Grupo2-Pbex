import sequelize, { testConnection } from '../config/database.js';
import {
  User,
  Product,
  ProductionRecord,
  QualityControl,
  Defect,
  Certificate,
  Alert,
  NonConformity,
} from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const initDatabase = async () => {
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
    console.error('✗ Error al inicializar base de datos:', error);
    process.exit(1);
  }
};

initDatabase();

