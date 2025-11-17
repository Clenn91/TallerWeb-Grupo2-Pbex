import { Product } from '../models/index.js';
import { Op } from 'sequelize';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_SLUG_MAP,
} from '../config/constants.js';

const formatCategoryValue = (rawCategory) => {
  if (!rawCategory) return null;
  const value = rawCategory.toString().trim();
  if (!value) return null;
  const slugMatch = PRODUCT_CATEGORY_SLUG_MAP[value.toLowerCase()];
  if (slugMatch) {
    return slugMatch;
  }
  const formatted = value.replace(/_/g, ' ').toUpperCase();
  return PRODUCT_CATEGORIES.includes(formatted) ? formatted : null;
};

export const getProducts = async (filters = {}) => {
  const { category, active, search, page = 1, limit = 50 } = filters;

  const where = {};
  const normalizedCategory = formatCategoryValue(category);
  if (normalizedCategory) where.category = normalizedCategory;
  if (active !== undefined) where.active = active;
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Product.findAndCountAll({
    where,
    limit,
    offset,
    order: [['name', 'ASC']],
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const getProductById = async (productId) => {
  return await Product.findByPk(productId);
};

export const createProduct = async (productData) => {
  return await Product.create(productData);
};

export const updateProduct = async (productId, productData) => {
  const product = await Product.findByPk(productId);
  if (!product) {
    throw new Error('Producto no encontrado');
  }
  await product.update(productData);
  return product;
};

export const deleteProduct = async (productId) => {
  const product = await Product.findByPk(productId);
  if (!product) {
    throw new Error('Producto no encontrado');
  }
  await product.update({ active: false });
  return product;
};

