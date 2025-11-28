import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { productAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  USER_ROLES,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABEL_BY_VALUE,
  PRODUCT_CATEGORY_VALUE_BY_SLUG,
  PRODUCT_MATERIALS,
} from "../utils/constants";
import toast from "react-hot-toast";
import type { Product } from "../types";

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  material: string;
  alertThreshold: number;
  active: boolean;
  imageUrl: string;
}

const Products = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Obtener filtros de la URL
  const selectedCategories = searchParams.get("categories")?.split(",").filter(Boolean) || [];
  const selectedMaterials = searchParams.get("materials")?.split(",").filter(Boolean) || [];
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "",
    material: "",
    alertThreshold: 5.0,
    active: true,
    imageUrl: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const normalizeCategoryValue = (value: string = ""): string => {
    if (!value) return "";
    const trimmed = value.toString().trim();
    const slugMatch = PRODUCT_CATEGORY_VALUE_BY_SLUG[trimmed.toLowerCase()];
    if (slugMatch) {
      return slugMatch;
    }
    const formatted = trimmed.replace(/_/g, " ").toUpperCase();
    return PRODUCT_CATEGORY_LABEL_BY_VALUE[formatted] ? formatted : "";
  };

  const getDisplayCategory = (value: string | null | undefined): string => {
    if (!value) return "Sin categoría";
    const normalized = normalizeCategoryValue(value);
    if (normalized) {
      return PRODUCT_CATEGORY_LABEL_BY_VALUE[normalized] || normalized;
    }
    return value;
  };

  // Función para actualizar filtros en la URL
  const updateFilters = (categories: string[], materials: string[]) => {
    const params = new URLSearchParams();
    if (categories.length > 0) {
      params.set("categories", categories.join(","));
    }
    if (materials.length > 0) {
      params.set("materials", materials.join(","));
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
    ["products", selectedCategories.join(","), selectedMaterials.join(",")],
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

  const createProductMutation = useMutation((data: FormData) => productAPI.create(data), {
    onSuccess: () => {
      toast.success("Producto creado correctamente");
      queryClient.invalidateQueries("products");
      setShowModal(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error("Error al crear producto:", error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Error al crear producto. Por favor, verifique los datos e intente nuevamente.";
      toast.error(errorMessage);
    },
  });

  const updateProductMutation = useMutation(
    ({ id, data }: { id: number; data: FormData }) => productAPI.update(id, data),
    {
      onSuccess: () => {
        toast.success("Producto actualizado correctamente");
        queryClient.invalidateQueries("products");
        setShowModal(false);
        setEditingProduct(null);
        resetForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Error al actualizar producto"
        );
      },
    }
  );

  const resetForm = (categoryValue: string = ""): void => {
    setFormData({
      name: "",
      description: "",
      category: categoryValue,
      material: "",
      alertThreshold: 5.0,
      active: true,
      imageUrl: "",
    });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleOpenModal = (product: Product | null = null): void => {
    console.log("handleOpenModal llamado", { product });
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || "",
        description: product.description || "",
        category: normalizeCategoryValue(product.category),
        material: product.material || "",
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
      resetForm(selectedCategories.length > 0 ? selectedCategories[0] : "");
    }
    setShowModal(true);
    console.log("showModal establecido a true");
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
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
        setImagePreview(reader.result as string);
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

  const handleCloseModal = (): void => {
    setShowModal(false);
    setEditingProduct(null);
    resetForm();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    console.log("handleSubmit llamado", { formData, editingProduct });

    // Validación adicional
    if (!formData.name.trim()) {
      toast.error("El nombre del producto es obligatorio");
      return;
    }

    if (!formData.category) {
      toast.error("Debe seleccionar una categoría");
      return;
    }

    if (!formData.material) {
      toast.error("Debe seleccionar un material");
      return;
    }

    // Crear FormData para enviar imagen
    const submitData = new FormData();
    submitData.append("name", formData.name.trim());
    submitData.append("description", formData.description || "");
    submitData.append("category", formData.category);
    submitData.append("material", formData.material);
    submitData.append("alertThreshold", formData.alertThreshold.toString());
    submitData.append("active", formData.active.toString());

    // Si hay una nueva imagen, agregarla
    if (selectedImage) {
      submitData.append("image", selectedImage);
    }

    // Si estamos editando y no hay nueva imagen pero hay imageUrl existente, mantenerla
    if (editingProduct && !selectedImage && formData.imageUrl) {
      submitData.append("imageUrl", formData.imageUrl);
    }

    console.log("Enviando datos:", {
      editing: !!editingProduct,
      hasImage: !!selectedImage,
      formDataKeys: Object.keys(formData),
    });

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="mt-1 text-sm text-gray-500">Catálogo de productos</p>
        </div>
        <div className="flex space-x-3">
          {canManageProducts && (
            <button
              onClick={() => {
                console.log("Botón Crear Producto clickeado");
                handleOpenModal();
              }}
              className="btn btn-primary"
              type="button"
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
            <span>{showFilters ? "▲" : "▼"}</span>
          </button>

          {/* Panel de filtros */}
          <div
            className={`${
              showFilters ? "block" : "hidden"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {data?.data?.map((product) => (
          <div key={product.id} className="card">
            {product.imageUrl && (
              <div className="mb-4">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg bg-white"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // Si la URL relativa falla, intentar con URL completa
                    if (
                      product.imageUrl &&
                      !product.imageUrl.startsWith("http")
                    ) {
                      const fullUrl = `${window.location.origin}${product.imageUrl}`;
                      if (target.src !== fullUrl) {
                        target.src = fullUrl;
                        return;
                      }
                    }
                    target.style.display = "none";
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
            {product.code && (
              <p className="text-xs text-gray-500">
                <span className="font-medium">Código:</span> {product.code}
              </p>
            )}
            <p className="text-xs text-gray-500">
              <span className="font-medium">Categoría:</span> {getDisplayCategory(product.category)}
            </p>
            {product.material && (
              <p className="text-xs text-gray-500">
                <span className="font-medium">Material:</span> {product.material}
              </p>
            )}
            <p className="text-xs text-gray-500">
              <span className="font-medium">Umbral de Alerta:</span>{" "}
              {product.alertThreshold}%
            </p>
          </div>
        ))}
          </div>
        </div>
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
                  rows={3}
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
                  Material *
                </label>
                <select
                  className="input"
                  value={formData.material}
                  onChange={(e) =>
                    setFormData({ ...formData, material: e.target.value })
                  }
                  required
                >
                  <option value="">Seleccione un material</option>
                  {PRODUCT_MATERIALS.map((material) => (
                    <option key={material} value={material}>
                      {material}
                    </option>
                  ))}
                </select>
              </div>

              {editingProduct && editingProduct.code && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código del Producto
                  </label>
                  <input
                    type="text"
                    className="input bg-gray-100"
                    value={editingProduct.code}
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El código se genera automáticamente y no puede modificarse
                  </p>
                </div>
              )}

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
                        const target = e.target as HTMLImageElement;
                        // Si es una URL (no un data URL), intentar con URL completa
                        if (imagePreview && !imagePreview.startsWith("data:")) {
                          const fullUrl = imagePreview.startsWith("http")
                            ? imagePreview
                            : `${window.location.origin}${imagePreview}`;
                          if (target.src !== fullUrl) {
                            target.src = fullUrl;
                            return;
                          }
                        }
                        target.style.display = "none";
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
                            ) as HTMLInputElement;
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
                  onClick={(e) => {
                    console.log("Botón submit clickeado", {
                      isLoading: createProductMutation.isLoading || updateProductMutation.isLoading,
                      formData,
                    });
                  }}
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

