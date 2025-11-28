import { User } from '../models/index.js';
import { Op } from 'sequelize';
import { USER_ROLES } from '../config/constants.js';
import type {
  UserInstance,
  PublicUserData,
  UserRole,
  PaginationResult,
} from '../types/index.js';

interface UserFilters {
  role?: UserRole;
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

interface UserData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
}

interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  fullName?: string;
  role?: UserRole;
  active?: boolean;
}

export const getUsers = async (
  filters: UserFilters = {}
): Promise<PaginationResult<PublicUserData>> => {
  const { role, active, search, page = 1, limit = 20 } = filters;

  const where: any = {};
  if (role) where.role = role;
  if (active !== undefined) where.active = active;
  if (search) {
    where[Op.or] = [
      { username: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { fullName: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password'] },
    limit,
    offset,
    order: [['fullName', 'ASC']],
  });

  return {
    data: rows.map((user) => user.toPublicJSON()),
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const getUserById = async (userId: number): Promise<PublicUserData> => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
  }) as UserInstance | null;
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  return user.toPublicJSON();
};

export const createUser = async (userData: UserData): Promise<PublicUserData> => {
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

  const user = await User.create({
    username,
    email,
    password,
    fullName,
    role: role || USER_ROLES.ASSISTANT,
  });

  return user.toPublicJSON();
};

export const updateUser = async (
  userId: number,
  userData: UpdateUserData
): Promise<PublicUserData> => {
  const user = await User.findByPk(userId) as UserInstance | null;
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Si se actualiza username o email, verificar que no exista otro usuario con esos valores
  if (userData.username || userData.email) {
    const existingUser = await User.findOne({
      where: {
        id: { [Op.ne]: userId },
        [Op.or]: [
          ...(userData.username ? [{ username: userData.username }] : []),
          ...(userData.email ? [{ email: userData.email }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new Error('El usuario o email ya está en uso');
    }
  }

  await user.update(userData);
  return user.toPublicJSON();
};

export const deleteUser = async (userId: number): Promise<PublicUserData> => {
  const user = await User.findByPk(userId) as UserInstance | null;
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  await user.update({ active: false });
  return user.toPublicJSON();
};

export const updateUserPassword = async (
  userId: number,
  newPassword: string
): Promise<{ success: boolean }> => {
  const user = await User.findByPk(userId) as UserInstance | null;
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  await user.update({ password: newPassword });
  return { success: true };
};

