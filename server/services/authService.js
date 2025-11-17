import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { USER_ROLES } from '../config/constants.js';
import { Op } from 'sequelize';

export const login = async (username, password) => {
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
  const token = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    }
  );

  return {
    token,
    user: user.toPublicJSON(),
  };
};

export const register = async (userData) => {
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
    role: role || USER_ROLES.ASSISTANT,
  });

  return user.toPublicJSON();
};

export const getCurrentUser = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  return user.toPublicJSON();
};

