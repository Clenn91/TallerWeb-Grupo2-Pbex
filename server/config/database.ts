import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const deploymentMode = process.env.DEPLOYMENT_MODE || 'local';

interface DbConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

// Configuración según el modo de despliegue
const getDbConfig = (): DbConfig => {
  if (deploymentMode === 'cloud') {
    return {
      host: process.env.DB_HOST_CLOUD || process.env.DB_HOST || '',
      port: parseInt(process.env.DB_PORT_CLOUD || process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME_CLOUD || process.env.DB_NAME || '',
      username: process.env.DB_USER_CLOUD || process.env.DB_USER || '',
      password: process.env.DB_PASSWORD_CLOUD || process.env.DB_PASSWORD || '',
    };
  } else {
    // Modo local (por defecto)
    return {
      host: process.env.DB_HOST_LOCAL || process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT_LOCAL || process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME_LOCAL || process.env.DB_NAME || 'pbex_quality_db',
      username: process.env.DB_USER_LOCAL || process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD_LOCAL || process.env.DB_PASSWORD || '',
    };
  }
};

const dbConfig = getDbConfig();

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: false,
    },
  }
);

// Función para probar la conexión
export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    console.log(`✓ Conexión a PostgreSQL establecida correctamente (modo: ${deploymentMode})`);
    console.log(`  Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`  Database: ${dbConfig.database}`);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('✗ Error al conectar a PostgreSQL:', errorMessage);
    return false;
  }
};

export default sequelize;

