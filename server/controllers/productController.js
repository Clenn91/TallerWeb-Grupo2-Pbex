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
} from '../config/constants.js';

export const getProductsController = async (req, res, next) => {
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

export const getProductByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

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

// Función helper para normalizar datos de FormData
const normalizeProductData = (body) => {
  const category = formatCategoryValue(body.category);
  if (!category) {
    const error = new Error(
      'Categoría inválida. Seleccione una categoría válida.'
    );
    error.statusCode = 400;
    throw error;
  }

  return {
    name: body.name,
    description: body.description || null,
    category,
    specifications: body.specifications || null,
    imageUrl: body.imageUrl || null,
    alertThreshold: body.alertThreshold ? parseFloat(body.alertThreshold) : 5.0,
    active: body.active === 'true' || body.active === true || body.active === '1',
  };
};

export const createProductController = async (req, res, next) => {
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

export const updateProductController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const normalizedData = normalizeProductData(req.body);
    const product = await updateProduct(id, normalizedData);

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProductController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await deleteProduct(id);

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

