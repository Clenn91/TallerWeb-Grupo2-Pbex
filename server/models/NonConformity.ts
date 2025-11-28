import { DataTypes, ModelStatic, Model } from 'sequelize';
import sequelize from '../config/database.js';
import type { NonConformityAttributes, NonConformityCreationAttributes, NonConformityInstance } from '../types/index.js';

const NonConformity = sequelize.define(
  'NonConformity',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Código único de no conformidad',
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'product_id',
      references: {
        model: 'products',
        key: 'id',
      },
    },
    productionRecordId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'production_record_id',
      references: {
        model: 'production_records',
        key: 'id',
      },
    },
    reportedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'reported_by',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM('baja', 'media', 'alta', 'critica'),
      allowNull: false,
      defaultValue: 'media',
    },
    status: {
      type: DataTypes.ENUM('abierta', 'en_revision', 'resuelta', 'cerrada'),
      allowNull: false,
      defaultValue: 'abierta',
    },
    correctiveAction: {
      type: DataTypes.TEXT,
      field: 'corrective_action',
      allowNull: true,
    },
    resolvedBy: {
      type: DataTypes.INTEGER,
      field: 'resolved_by',
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    resolvedAt: {
      type: DataTypes.DATE,
      field: 'resolved_at',
      allowNull: true,
    },
  },
  {
    tableName: 'non_conformities',
    timestamps: true,
    indexes: [
      { fields: ['code'], unique: true },
      { fields: ['product_id'] },
      { fields: ['status'] },
      { fields: ['severity'] },
    ],
  }
) as ModelStatic<Model<NonConformityAttributes, NonConformityCreationAttributes> & NonConformityInstance>;

export default NonConformity;

