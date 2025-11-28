import { DataTypes, ModelStatic, Model } from 'sequelize';
import sequelize from '../config/database.js';
import type { ProductAttributes, ProductCreationAttributes, ProductInstance } from '../types/index.js';

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
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    material: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      field: 'image_url',
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
) as ModelStatic<Model<ProductAttributes, ProductCreationAttributes> & ProductInstance>;

export default Product;

