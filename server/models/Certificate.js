import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { CERTIFICATE_STATUS } from '../config/constants.js';

const Certificate = sequelize.define(
  'Certificate',
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
      comment: 'Código único del certificado',
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
    productionRecordId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'production_record_id',
      references: {
        model: 'production_records',
        key: 'id',
      },
    },
    qualityControlId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'quality_control_id',
      references: {
        model: 'quality_controls',
        key: 'id',
      },
    },
    requestedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'requested_by',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'approved_by',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'),
      allowNull: false,
      defaultValue: 'pendiente',
    },
    pdfPath: {
      type: DataTypes.STRING(500),
      field: 'pdf_path',
      allowNull: true,
      comment: 'Ruta al archivo PDF generado',
    },
    approvedAt: {
      type: DataTypes.DATE,
      field: 'approved_at',
      allowNull: true,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      field: 'rejection_reason',
      allowNull: true,
    },
  },
  {
    tableName: 'certificates',
    timestamps: true,
    indexes: [
      { fields: ['code'], unique: true },
      { fields: ['product_id'] },
      { fields: ['production_record_id'] },
      { fields: ['status'] },
    ],
  }
);

export default Certificate;

