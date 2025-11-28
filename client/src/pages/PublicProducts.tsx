import { useState } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABEL_BY_VALUE,
  PRODUCT_CATEGORY_VALUE_BY_SLUG,
  PRODUCT_MATERIALS,
} from '../utils/constants';
import type { Product } from '../types';

const PublicProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Obtener filtros de la URL
  const selectedCategories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
  const selectedMaterials = searchParams.get('materials')?.split(',').filter(Boolean) || [];

  // Función para actualizar filtros en la URL
  const updateFilters = (categories: string[], materials: string[]) => {
    const params = new URLSearchParams();
    if (categories.length > 0) {
      params.set('categories', categories.join(','));
    }
    if (materials.length > 0) {
      params.set('materials', materials.join(','));
    }
    setSearchParams(params);
  };

  // Manejar cambio de checkbox de categoría
  const handleCategoryToggle = (categoryValue: string) => {
    const newCategories = selectedCategories.includes(categoryValue)
      ? selectedCategories.filter((c) => c !== categoryValue)
      : [...selectedCategories, categoryValue];
    updateFilters(newCategories, selectedMaterials);
  };

  // Manejar cambio de checkbox de material
  const handleMaterialToggle = (material: string) => {
    const newMaterials = selectedMaterials.includes(material)
      ? selectedMaterials.filter((m) => m !== material)
      : [...selectedMaterials, material];
    updateFilters(selectedCategories, newMaterials);
  };

  const { data, isLoading } = useQuery<{ data: Product[] }>(
    ['public-products', selectedCategories.join(','), selectedMaterials.join(',')],
    () => {
      const params: { active: boolean; category?: string[]; material?: string[] } = { active: true };
      if (selectedCategories.length > 0) {
        params.category = selectedCategories;
      }
      if (selectedMaterials.length > 0) {
        params.material = selectedMaterials;
      }
      return productAPI.getAll(params).then((res) => res.data);
    }
  );

  const products = data?.data || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Catálogo de Productos
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {products.length} {products.length === 1 ? 'producto disponible' : 'productos disponibles'}
            </p>
          </div>

          {/* Layout con sidebar y contenido */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar de filtros */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              {/* Botón para mostrar/ocultar filtros en móvil */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden w-full btn btn-secondary mb-4 flex items-center justify-between"
              >
                <span>Filtros</span>
                <span>{showFilters ? '▲' : '▼'}</span>
              </button>

              {/* Panel de filtros */}
              <div
                className={`${
                  showFilters ? 'block' : 'hidden'
                } lg:block bg-white rounded-lg shadow p-4 space-y-6`}
              >
                {/* Filtros de Categorías */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b-2 border-red-500">
                    CATEGORÍAS
                  </h2>
                  <div className="space-y-2">
                    {PRODUCT_CATEGORIES.map((category) => {
                      const isChecked = selectedCategories.includes(category.value);
                      return (
                        <label
                          key={category.value}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCategoryToggle(category.value)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">
                            {category.value}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Filtros de Materiales */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b-2 border-red-500">
                    MATERIAL
                  </h2>
                  <div className="space-y-2">
                    {PRODUCT_MATERIALS.map((material) => {
                      const isChecked = selectedMaterials.includes(material);
                      return (
                        <label
                          key={material}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleMaterialToggle(material)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">{material}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>

            {/* Contenido principal */}
            <div className="flex-1">
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
                  <p className="text-xl text-gray-600 mb-2">No se encontraron productos</p>
                  <p className="text-gray-500">
                    No hay productos disponibles con los filtros seleccionados.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="card hover:shadow-lg transition-shadow">
                  {product.imageUrl && (
                    <div className="mb-4">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg bg-white"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          // Si la URL relativa falla, intentar con URL completa
                          if (product.imageUrl && !product.imageUrl.startsWith('http')) {
                            const fullUrl = `${window.location.origin}${product.imageUrl}`;
                            if (target.src !== fullUrl) {
                              target.src = fullUrl;
                              return;
                            }
                          }
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  {!product.imageUrl && (
                    <div className="mb-4 w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <i className="fas fa-box text-4xl text-gray-400"></i>
                    </div>
                  )}
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">{product.name}</h3>
                  {product.code && (
                    <p className="text-xs text-gray-500 mb-1">
                      <span className="font-medium">Código:</span> {product.code}
                    </p>
                  )}
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Categoría:</span>{' '}
                    {product.category || 'Sin categoría'}
                  </p>
                  {product.material && (
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Material:</span> {product.material}
                    </p>
                  )}
                </div>
              ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicProducts;

