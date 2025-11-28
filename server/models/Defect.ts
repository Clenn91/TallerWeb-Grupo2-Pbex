import { DataTypes, ModelStatic, Model } from 'sequelize';
import sequelize from '../config/database.js';
import type { DefectAttributes, DefectCreationAttributes, DefectInstance } from '../types/index.js';

const Defect = sequelize.define(
  'Defect',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    qualityControlId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'quality_control_id',
      references: {
        model: 'quality_controls',
        key: 'id',
      },
    },
    defectType: {
      type: DataTypes.ENUM(
        'mancha',
        'rebaba',
        'incompleto',
        'deformacion',
        'rayon',
        'otro'
      ),
      allowNull: false,
      field: 'defect_type',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'defects',
    timestamps: true,
    indexes: [
      { fields: ['quality_control_id'] },
      { fields: ['defect_type'] },
    ],
  }
) as ModelStatic<Model<DefectAttributes, DefectCreationAttributes> & DefectInstance>;

export default Defect;

