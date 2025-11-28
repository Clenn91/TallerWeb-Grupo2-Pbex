import { Product } from '../models/index.js';
import { Op } from 'sequelize';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_SLUG_MAP,
  PRODUCT_MATERIALS,
  generateProductCode,
} from '../config/constants.js';
import type {
  ProductInstance,
  PaginationResult,
} from '../types/index.js';

const formatCategoryValue = (rawCategory: any): string | null => {
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

interface ProductFilters {
  category?: string | string[];
  material?: string | string[];
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

interface ProductData {
  name: string;
  description?: string | null;
  code?: string;
  category: string;
  material: string;
  imageUrl?: string | null;
  technicalSheet?: string | null;
  active?: boolean;
  alertThreshold?: number;
}

export const getProducts = async (
  filters: ProductFilters = {}
): Promise<PaginationResult<ProductInstance>> => {
  const { category, material, active, search, page = 1, limit = 50 } = filters;

  const where: any = {};
  
  // Normalizar categorías (puede ser string, array o string separado por comas)
  if (category) {
    const categories = Array.isArray(category) 
      ? category 
      : typeof category === 'string' 
        ? category.split(',').map(c => c.trim())
        : [category];
    
    const normalizedCategories = categories
      .map(cat => formatCategoryValue(cat))
      .filter((cat): cat is string => cat !== null);
    
    if (normalizedCategories.length > 0) {
      if (normalizedCategories.length === 1) {
        where.category = normalizedCategories[0];
      } else {
        where.category = { [Op.in]: normalizedCategories };
      }
    }
  }
  
  // Normalizar materiales (puede ser string, array o string separado por comas)
  if (material) {
    const materials = Array.isArray(material)
      ? material
      : typeof material === 'string'
        ? material.split(',').map(m => m.trim())
        : [material];
    
    const validMaterials = materials
      .map(m => m.toString().trim().toUpperCase())
      .filter(m => PRODUCT_MATERIALS.includes(m as any));
    
    if (validMaterials.length > 0) {
      if (validMaterials.length === 1) {
        where.material = validMaterials[0];
      } else {
        where.material = { [Op.in]: validMaterials };
      }
    }
  }
  
  if (active !== undefined) where.active = active;
  
  if (search) {
    const searchConditions = [
      { name: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
      { code: { [Op.iLike]: `%${search}%` } },
    ];
    
    // Si ya hay condiciones OR, combinarlas
    if (where[Op.or]) {
      where[Op.and] = [
        { [Op.or]: where[Op.or] },
        { [Op.or]: searchConditions },
      ];
      delete where[Op.or];
    } else {
      where[Op.or] = searchConditions;
    }
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Product.findAndCountAll({
    where,
    limit,
    offset,
    order: [['name', 'ASC']],
  });

  return {
    data: rows as ProductInstance[],
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const getProductById = async (
  productId: number
): Promise<ProductInstance | null> => {
  return await Product.findByPk(productId) as ProductInstance | null;
};

export const createProduct = async (
  productData: ProductData
): Promise<ProductInstance> => {
  // Generar código automáticamente si no se proporciona
  let code = productData.code;
  if (!code && productData.category && productData.material) {
    // Primero intentar con el código base (categoría + material)
    let generatedCode = generateProductCode(productData.category, productData.material);
    
    // Verificar si ya existe un producto con ese código
    const existingProduct = await Product.findOne({ where: { code: generatedCode } });
    
    if (existingProduct) {
      // Si existe, buscar el siguiente número secuencial disponible
      // Buscar todos los productos con la misma categoría y material
      const similarProducts = await Product.findAll({
        where: {
          category: productData.category,
          material: productData.material,
        },
      });
      
      // Encontrar el siguiente número secuencial disponible
      let sequenceNumber = 1;
      let foundAvailable = false;
      
      while (!foundAvailable && sequenceNumber < 1000) {
        generatedCode = generateProductCode(productData.category, productData.material, sequenceNumber);
        const exists = await Product.findOne({ where: { code: generatedCode } });
        if (!exists) {
          foundAvailable = true;
        } else {
          sequenceNumber++;
        }
      }
      
      if (!foundAvailable) {
        throw new Error('No se pudo generar un código único para el producto');
      }
    }
    
    code = generatedCode;
  }
  
  if (!code) {
    throw new Error('No se pudo generar el código del producto. Verifique que la categoría y material sean válidos.');
  }
  
  return await Product.create({
    ...productData,
    code,
  }) as ProductInstance;
};

export const updateProduct = async (
  productId: number,
  productData: Partial<ProductData>
): Promise<ProductInstance> => {
  const product = await Product.findByPk(productId) as ProductInstance | null;
  if (!product) {
    throw new Error('Producto no encontrado');
  }
  await product.update(productData);
  return product;
};

export const deleteProduct = async (
  productId: number
): Promise<ProductInstance> => {
  const product = await Product.findByPk(productId) as ProductInstance | null;
  if (!product) {
    throw new Error('Producto no encontrado');
  }
  await product.update({ active: false });
  return product;
};

