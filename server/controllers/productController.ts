import { Response, NextFunction } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/productService.js';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_SLUG_MAP,
  PRODUCT_MATERIALS,
} from '../config/constants.js';
import type { AuthRequest } from '../types/index.js';

export const getProductsController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = req.query;
    const result = await getProducts(filters);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductByIdController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await getProductById(parseInt(id, 10));

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
      return;
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

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

// Función helper para normalizar material
const formatMaterialValue = (rawMaterial: any): string | null => {
  if (!rawMaterial) return null;
  const value = rawMaterial.toString().trim().toUpperCase();
  if (!value) return null;
  return PRODUCT_MATERIALS.includes(value as any) ? value : null;
};

// Función helper para normalizar datos de FormData
const normalizeProductData = (body: any) => {
  const category = formatCategoryValue(body.category);
  if (!category) {
    const error = new Error(
      'Categoría inválida. Seleccione una categoría válida.'
    );
    (error as any).statusCode = 400;
    throw error;
  }

  const material = formatMaterialValue(body.material);
  if (!material) {
    const error = new Error(
      'Material inválido. Seleccione un material válido.'
    );
    (error as any).statusCode = 400;
    throw error;
  }

  return {
    name: body.name,
    description: body.description || null,
    category,
    material,
    imageUrl: body.imageUrl || null,
    alertThreshold: body.alertThreshold ? parseFloat(body.alertThreshold) : 5.0,
    active: body.active === 'true' || body.active === true || body.active === '1',
  };
};

export const createProductController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const normalizedData = normalizeProductData(req.body);
    const product = await createProduct(normalizedData);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const normalizedData = normalizeProductData(req.body);
    const product = await updateProduct(parseInt(id, 10), normalizedData);

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProductController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await deleteProduct(parseInt(id, 10));

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

