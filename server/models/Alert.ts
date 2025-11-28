import { DataTypes, ModelStatic, Model } from "sequelize";
import sequelize from "../config/database.js";
import type {
  AlertAttributes,
  AlertCreationAttributes,
  AlertInstance,
} from "../types/index.js";

const Alert = sequelize.define(
  "Alert",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "product_id",
      references: {
        model: "products",
        key: "id",
      },
    },
    productionRecordId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "production_record_id",
      references: {
        model: "production_records",
        key: "id",
      },
    },
    qualityControlId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "quality_control_id",
      references: {
        model: "quality_controls",
        key: "id",
      },
    },
    alertType: {
      type: DataTypes.STRING(50),
      field: "alert_type",
      allowNull: false,
      defaultValue: "waste_threshold",
      comment: "Tipo de alerta: waste_threshold, non_conformity, etc.",
    },
    threshold: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      comment: "Umbral configurado",
    },
    actualValue: {
      type: DataTypes.DECIMAL(5, 2),
      field: "actual_value",
      allowNull: false,
      comment: "Valor actual que activó la alerta",
    },
    status: {
      type: DataTypes.ENUM("activa", "resuelta", "descartada"),
      allowNull: false,
      defaultValue: "activa",
    },
    resolvedBy: {
      type: DataTypes.INTEGER,
      field: "resolved_by",
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    resolvedAt: {
      type: DataTypes.DATE,
      field: "resolved_at",
      allowNull: true,
    },
    resolutionNotes: {
      type: DataTypes.TEXT,
      field: "resolution_notes",
      allowNull: true,
    },
    emailSent: {
      type: DataTypes.BOOLEAN,
      field: "email_sent",
      defaultValue: false,
    },
  },
  {
    tableName: "alerts",
    timestamps: true,
    indexes: [
      { fields: ["product_id"] },
      { fields: ["status"] },
      { fields: ["alert_type"] },
    ],
  }
) as ModelStatic<
  Model<AlertAttributes, AlertCreationAttributes> & AlertInstance
>;

export default Alert;
