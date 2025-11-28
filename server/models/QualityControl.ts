import { DataTypes, ModelStatic, Model } from 'sequelize';
import sequelize from '../config/database.js';
import type { QualityControlAttributes, QualityControlCreationAttributes, QualityControlInstance } from '../types/index.js';

const QualityControl = sequelize.define(
  'QualityControl',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productionRecordId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'production_record_id',
      references: {
        model: 'production_records',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    weight: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      comment: 'Peso en gramos',
    },
    diameter: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Diámetro en mm',
    },
    height: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Altura en mm',
    },
    width: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Ancho en mm',
    },
    otherMeasurements: {
      type: DataTypes.JSONB,
      field: 'other_measurements',
      allowNull: true,
      comment: 'Otras medidas en formato JSON',
    },
    wastePercentage: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'waste_percentage',
      defaultValue: 0,
      comment: 'Porcentaje de merma calculado',
    },
    approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'quality_controls',
    timestamps: true,
    indexes: [
      { fields: ['production_record_id'] },
      { fields: ['user_id'] },
    ],
  }
) as ModelStatic<Model<QualityControlAttributes, QualityControlCreationAttributes> & QualityControlInstance>;

export default QualityControl;

