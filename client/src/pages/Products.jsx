import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { productAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  USER_ROLES,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABEL_BY_VALUE,
  PRODUCT_CATEGORY_VALUE_BY_SLUG,
} from "../utils/constants";
import toast from "react-hot-toast";

const Products = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    specifications: "",
    alertThreshold: 5.0,
    active: true,
    imageUrl: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const normalizeCategoryValue = (value = "") => {
    if (!value) return "";
    const trimmed = value.toString().trim();
    const slugMatch = PRODUCT_CATEGORY_VALUE_BY_SLUG[trimmed.toLowerCase()];
    if (slugMatch) {
      return slugMatch;
    }
    const formatted = trimmed.replace(/_/g, " ").toUpperCase();
    return PRODUCT_CATEGORY_LABEL_BY_VALUE[formatted] ? formatted : "";
  };

  const getDisplayCategory = (value) => {
    if (!value) return "Sin categoría";
    const normalized = normalizeCategoryValue(value);
    if (normalized) {
      return PRODUCT_CATEGORY_LABEL_BY_VALUE[normalized] || normalized;
    }
    return value;
  };

  const { data, isLoading } = useQuery(
    ["products", categoryFilter],
    () => {
      const params = { active: true };
      if (categoryFilter !== "all") {
        params.category = categoryFilter;
      }
      return productAPI.getAll(params).then((res) => res.data);
    }
  );

  const createProductMutation = useMutation((data) => productAPI.create(data), {
    onSuccess: () => {
      toast.success("Producto creado correctamente");
      queryClient.invalidateQueries("products");
      setShowModal(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error al crear producto");
    },
  });

  const updateProductMutation = useMutation(
    ({ id, data }) => productAPI.update(id, data),
    {
      onSuccess: () => {
        toast.success("Producto actualizado correctamente");
        queryClient.invalidateQueries("products");
        setShowModal(false);
        setEditingProduct(null);
        resetForm();
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Error al actualizar producto"
        );
      },
    }
  );

  const resetForm = (categoryValue = "") => {
    setFormData({
      name: "",
      description: "",
      category: categoryValue,
      specifications: "",
      alertThreshold: 5.0,
      active: true,
      imageUrl: "",
    });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || "",
        description: product.description || "",
        category: normalizeCategoryValue(product.category),
        specifications: product.specifications || "",
        alertThreshold: product.alertThreshold || 5.0,
        active: product.active !== undefined ? product.active : true,
        imageUrl: product.imageUrl || "",
      });
      // Si hay una imagen existente, establecerla como preview
      // Asegurar que la URL sea absoluta si es relativa
      if (product.imageUrl) {
        const imageUrl = product.imageUrl.startsWith("http")
          ? product.imageUrl
          : product.imageUrl.startsWith("/")
          ? product.imageUrl
          : `/${product.imageUrl}`;
        setImagePreview(imageUrl);
      } else {
        setImagePreview(null);
      }
      setSelectedImage(null);
    } else {
      resetForm(categoryFilter !== "all" ? categoryFilter : "");
    }
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
        toast.error("Solo se permiten archivos JPG y PNG");
        e.target.value = ""; // Limpiar el input
        return;
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no debe exceder 5MB");
        e.target.value = ""; // Limpiar el input
        return;
      }

      setSelectedImage(file);

      // Crear preview de la nueva imagen (esto reemplazará cualquier preview anterior)
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.onerror = () => {
        toast.error("Error al leer la imagen");
        setSelectedImage(null);
        setImagePreview(editingProduct?.imageUrl || null);
      };
      reader.readAsDataURL(file);
    } else {
      // Si no se selecciona archivo, restaurar la imagen original si existe
      setSelectedImage(null);
      setImagePreview(editingProduct?.imageUrl || null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Crear FormData para enviar imagen
    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("description", formData.description);
    submitData.append("category", formData.category);
    submitData.append("specifications", formData.specifications);
    submitData.append("alertThreshold", formData.alertThreshold);
    submitData.append("active", formData.active);

    // Si hay una nueva imagen, agregarla
    if (selectedImage) {
      submitData.append("image", selectedImage);
    }

    // Si estamos editando y no hay nueva imagen pero hay imageUrl existente, mantenerla
    if (editingProduct && !selectedImage && formData.imageUrl) {
      submitData.append("imageUrl", formData.imageUrl);
    }

    if (editingProduct) {
      updateProductMutation.mutate({
        id: editingProduct.id,
        data: submitData,
      });
    } else {
      createProductMutation.mutate(submitData);
    }
  };

  // Verificar si el usuario puede crear/editar productos
  const canManageProducts =
    user?.role === USER_ROLES.ADMIN ||
    user?.role === USER_ROLES.SUPERVISOR ||
    user?.role === USER_ROLES.ASSISTANT;

  if (isLoading) {
    return <div className="text-center py-8">Cargando productos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="mt-1 text-sm text-gray-500">Catálogo de productos</p>
        </div>
        <div className="flex space-x-3">
          {canManageProducts && (
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-primary"
            >
              + Crear Producto
            </button>
          )}
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-secondary"
          >
            ← Volver al Dashboard
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Filtrar por categoría
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              categoryFilter === "all"
                ? "bg-primary-600 text-white border-primary-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-primary-400"
            }`}
          >
            Todas
          </button>
          {PRODUCT_CATEGORIES.map((category) => {
            const isActive = categoryFilter === category.value;
            return (
              <button
                key={category.value}
                type="button"
                onClick={() => setCategoryFilter(category.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  isActive
                    ? "bg-primary-600 text-white border-primary-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-primary-400"
                }`}
              >
                {category.value}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data?.map((product) => (
          <div key={product.id} className="card">
            {product.imageUrl && (
              <div className="mb-4">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    // Si la URL relativa falla, intentar con URL completa
                    if (
                      product.imageUrl &&
                      !product.imageUrl.startsWith("http")
                    ) {
                      const fullUrl = `${window.location.origin}${product.imageUrl}`;
                      if (e.target.src !== fullUrl) {
                        e.target.src = fullUrl;
                        return;
                      }
                    }
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              {canManageProducts && (
                <button
                  onClick={() => handleOpenModal(product)}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                  title="Editar producto"
                >
                  ✏️ Editar
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{product.description}</p>
            <p className="text-xs text-gray-500">
              <span className="font-medium">Categoría:</span> {getDisplayCategory(product.category)}
            </p>
            <p className="text-xs text-gray-500">
              <span className="font-medium">Umbral de Alerta:</span>{" "}
              {product.alertThreshold}%
            </p>
            {product.specifications && (
              <p className="text-xs text-gray-500 mt-1">
                <span className="font-medium">Especificaciones:</span>{" "}
                {product.specifications}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Modal para crear/editar producto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingProduct ? "Editar Producto" : "Crear Nuevo Producto"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  className="input"
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  className="input"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                >
                  <option value="">Seleccione una categoría</option>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especificaciones
                </label>
                <textarea
                  className="input"
                  rows="2"
                  value={formData.specifications}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specifications: e.target.value,
                    })
                  }
                  placeholder="Ej: Capacidad: 20L, Material: HDPE, Color: Azul/Blanco"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen del Producto
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageChange}
                  className="input"
                  id="product-image-input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos permitidos: JPG, PNG (máximo 5MB). La imagen se
                  redimensionará automáticamente.
                </p>
                {imagePreview && (
                  <div className="mt-3 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        // Si es una URL (no un data URL), intentar con URL completa
                        if (imagePreview && !imagePreview.startsWith("data:")) {
                          const fullUrl = imagePreview.startsWith("http")
                            ? imagePreview
                            : `${window.location.origin}${imagePreview}`;
                          if (e.target.src !== fullUrl) {
                            e.target.src = fullUrl;
                            return;
                          }
                        }
                        e.target.style.display = "none";
                      }}
                    />
                    {selectedImage && (
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          Nueva imagen seleccionada: {selectedImage.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(editingProduct?.imageUrl || null);
                            const input = document.getElementById(
                              "product-image-input"
                            );
                            if (input) input.value = "";
                          }}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Umbral de Alerta (%) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  className="input"
                  value={formData.alertThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      alertThreshold: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Porcentaje de merma que activa alertas automáticas
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                />
                <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                  Producto activo
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    createProductMutation.isLoading ||
                    updateProductMutation.isLoading
                  }
                >
                  {createProductMutation.isLoading ||
                  updateProductMutation.isLoading
                    ? "Guardando..."
                    : editingProduct
                    ? "Guardar Cambios"
                    : "Crear Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
