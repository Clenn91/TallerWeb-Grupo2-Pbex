import { DataTypes, ModelStatic, Model } from 'sequelize';
import sequelize from '../config/database.js';
import type { ProductionRecordAttributes, ProductionRecordCreationAttributes, ProductionRecordInstance } from '../types/index.js';

const ProductionRecord = sequelize.define(
  'ProductionRecord',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'product_id',
      references: {
        model: 'products',
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
    lotNumber: {
      type: DataTypes.STRING(100),
      field: 'lot_number',
      allowNull: false,
    },
    productionDate: {
      type: DataTypes.DATEONLY,
      field: 'production_date',
      allowNull: false,
    },
    shift: {
      type: DataTypes.ENUM('mañana', 'tarde', 'noche'),
      allowNull: false,
    },
    productionLine: {
      type: DataTypes.STRING(50),
      field: 'production_line',
      allowNull: true,
    },
    totalProduced: {
      type: DataTypes.INTEGER,
      field: 'total_produced',
      allowNull: false,
      defaultValue: 0,
    },
    totalApproved: {
      type: DataTypes.INTEGER,
      field: 'total_approved',
      allowNull: false,
      defaultValue: 0,
    },
    totalRejected: {
      type: DataTypes.INTEGER,
      field: 'total_rejected',
      allowNull: false,
      defaultValue: 0,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'production_records',
    timestamps: true,
    indexes: [
      { fields: ['product_id'] },
      { fields: ['user_id'] },
      { fields: ['production_date'] },
      { fields: ['lot_number'] },
    ],
  }
) as ModelStatic<Model<ProductionRecordAttributes, ProductionRecordCreationAttributes> & ProductionRecordInstance>;

export default ProductionRecord;

