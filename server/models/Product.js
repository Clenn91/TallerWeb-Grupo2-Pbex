import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      field: 'image_url',
      allowNull: true,
    },
    specifications: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    technicalSheet: {
      type: DataTypes.TEXT,
      field: 'technical_sheet',
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    alertThreshold: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'alert_threshold',
      defaultValue: 5.0,
      comment: 'Porcentaje de merma que activa alertas',
    },
  },
  {
    tableName: 'products',
    timestamps: true,
  }
);

export default Product;

