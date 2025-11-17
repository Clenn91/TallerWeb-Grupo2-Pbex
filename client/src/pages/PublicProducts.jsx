import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABEL_BY_VALUE,
  PRODUCT_CATEGORY_VALUE_BY_SLUG,
} from '../utils/constants';

const PublicProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const normalizeCategoryParam = (param) => {
    if (!param) return null;
    const slugMatch = PRODUCT_CATEGORY_VALUE_BY_SLUG[param.toLowerCase()];
    if (slugMatch) {
      return slugMatch;
    }
    const formatted = param.replace(/_/g, ' ').toUpperCase();
    return PRODUCT_CATEGORY_LABEL_BY_VALUE[formatted] ? formatted : null;
  };

  const categoryValue = normalizeCategoryParam(categoryParam);
  const categoryLabel = categoryValue
    ? PRODUCT_CATEGORY_LABEL_BY_VALUE[categoryValue] || categoryValue
    : null;

  const { data, isLoading } = useQuery(
    ['public-products', categoryValue],
    () => {
      const params = { active: true };
      if (categoryValue) {
        params.category = categoryValue;
      }
      return productAPI.getAll(params).then((res) => res.data);
    }
  );

  const products = data?.data || [];
  const handleCategoryFilter = (slug) => {
    if (!slug) {
      setSearchParams({});
      return;
    }
    setSearchParams({ category: slug });
  };

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
            {categoryLabel && (
              <p className="mt-2 text-lg text-primary-600 font-semibold">
                {categoryLabel}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {products.length} {products.length === 1 ? 'producto disponible' : 'productos disponibles'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleCategoryFilter(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                !categoryValue
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
              }`}
            >
              Todas
            </button>
            {PRODUCT_CATEGORIES.map((category) => {
              const isActive = categoryValue === category.value;
              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleCategoryFilter(category.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                  }`}
                >
                  {category.value}
                </button>
              );
            })}
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
              <p className="text-xl text-gray-600 mb-2">No se encontraron productos</p>
              <p className="text-gray-500">
                {categoryLabel
                  ? `No hay productos disponibles en la categoría ${categoryLabel}.`
                  : 'No hay productos disponibles en este momento.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="card hover:shadow-lg transition-shadow">
                  {product.imageUrl && (
                    <div className="mb-4">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          // Si la URL relativa falla, intentar con URL completa
                          if (product.imageUrl && !product.imageUrl.startsWith('http')) {
                            const fullUrl = `${window.location.origin}${product.imageUrl}`;
                            if (e.target.src !== fullUrl) {
                              e.target.src = fullUrl;
                              return;
                            }
                          }
                          e.target.style.display = 'none';
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
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Categoría:</span>{' '}
                    {product.category || 'Sin categoría'}
                  </p>
                  {product.specifications && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {product.specifications}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicProducts;

