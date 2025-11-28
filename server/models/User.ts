import { DataTypes, ModelStatic, Model } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';
import type { UserAttributes, UserCreationAttributes, UserInstance, PublicUserData } from '../types/index.js';

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 100],
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255],
      },
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'full_name',
    },
    role: {
      type: DataTypes.ENUM(
        'asistente_calidad',
        'supervisor',
        'administrador',
        'gerencia',
        'visitante'
      ),
      allowNull: false,
      defaultValue: 'asistente_calidad',
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      field: 'last_login',
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user: Model<UserAttributes, UserCreationAttributes>) => {
        const userInstance = user as unknown as UserInstance;
        if (userInstance.password) {
          userInstance.password = await bcrypt.hash(userInstance.password, 10);
        }
      },
      beforeUpdate: async (user: Model<UserAttributes, UserCreationAttributes>) => {
        const userInstance = user as unknown as UserInstance;
        if (userInstance.changed('password')) {
          userInstance.password = await bcrypt.hash(userInstance.password, 10);
        }
      },
    },
  }
) as ModelStatic<Model<UserAttributes, UserCreationAttributes> & UserInstance>;

// Método para comparar contraseñas
(User.prototype as any).comparePassword = async function (this: UserInstance, candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para obtener datos públicos (sin contraseña)
(User.prototype as any).toPublicJSON = function (this: UserInstance): PublicUserData {
  const userData = this.toJSON();
  const { password, ...publicData } = userData as any;
  return {
    ...publicData,
    lastLogin: publicData.lastLogin || null,
    createdAt: publicData.createdAt || new Date(),
    updatedAt: publicData.updatedAt || new Date(),
  } as PublicUserData;
};

export default User;

