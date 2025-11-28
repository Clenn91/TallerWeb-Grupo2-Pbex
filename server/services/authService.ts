import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/index.js';
import { USER_ROLES } from '../config/constants.js';
import { Op } from 'sequelize';
import type { LoginResult, PublicUserData } from '../types/index.js';

interface UserData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role?: string;
}

export const login = async (username: string, password: string): Promise<LoginResult> => {
  const user = await User.findOne({
    where: { username, active: true },
  });

  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    throw new Error('Credenciales inválidas');
  }

  // Actualizar último login
  await user.update({ lastLogin: new Date() });

  // Generar token
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET no está configurado');
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  const token = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role,
    },
    jwtSecret,
    {
      expiresIn,
    } as SignOptions
  );

  return {
    token,
    user: user.toPublicJSON(),
  };
};

export const register = async (userData: UserData): Promise<PublicUserData> => {
  const { username, email, password, fullName, role } = userData;

  // Verificar si el usuario ya existe
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ username }, { email }],
    },
  });

  if (existingUser) {
    throw new Error('El usuario o email ya existe');
  }

  // Crear nuevo usuario
  const user = await User.create({
    username,
    email,
    password,
    fullName,
    role: (role as any) || USER_ROLES.ASSISTANT,
  });

  return user.toPublicJSON();
};

export const getCurrentUser = async (userId: number): Promise<PublicUserData> => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  return user.toPublicJSON();
};

