import { useState, FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { nonConformityAPI, productAPI, qualityAPI } from "../services/api";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import type { NonConformity, Product, ProductionRecord } from "../types";

const NonConformities = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Pre-llenar datos si viene de una alerta
  const alertData = location.state as any;
  const [formData, setFormData] = useState({
    productId: alertData?.productId?.toString() || "",
    productionRecordId: alertData?.productionRecordId?.toString() || "",
    description: alertData?.description || "",
    severity: alertData?.severity || "media" as "baja" | "media" | "alta" | "critica",
  });

  const { data, isLoading } = useQuery<{ data: NonConformity[] }>(
    "non-conformities",
    () => nonConformityAPI.getAll().then((res) => res.data)
  );

  // Obtener productos
  const { data: products } = useQuery<Product[]>("products", () =>
    productAPI.getAll({ active: true }).then((res) => res.data.data)
  );

  // Obtener registros de producción si hay producto seleccionado
  const { data: productionRecordsData } = useQuery<{ data: ProductionRecord[] }>(
    ["production-records", formData.productId],
    () =>
      qualityAPI
        .getProductionRecords({
          productId: formData.productId ? parseInt(formData.productId) : undefined,
          limit: 100,
        })
        .then((res) => res.data),
    { enabled: !!formData.productId }
  );

  const createMutation = useMutation(
    (data: any) => nonConformityAPI.create(data),
    {
      onSuccess: () => {
        toast.success("No conformidad reportada exitosamente");
        queryClient.invalidateQueries("non-conformities");
        setShowCreateModal(false);
        setFormData({
          productId: "",
          productionRecordId: "",
          description: "",
          severity: "media",
        });
        // Limpiar el estado de navegación
        if (location.state) {
          window.history.replaceState({}, document.title);
        }
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Error al reportar no conformidad"
        );
      },
    }
  );

  const handleCreateSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      toast.error("Debe proporcionar una descripción");
      return;
    }
    createMutation.mutate({
      productId: formData.productId ? parseInt(formData.productId) : null,
      productionRecordId: formData.productionRecordId
        ? parseInt(formData.productionRecordId)
        : null,
      description: formData.description,
      severity: formData.severity,
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando no conformidades...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">No Conformidades</h1>
          <p className="mt-1 text-sm text-gray-500">
            Registro de no conformidades
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          + Reportar No Conformidad
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Descripción</th>
                <th>Severidad</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((nc) => (
                <tr key={nc.id}>
                  <td>{nc.code}</td>
                  <td>{nc.product?.name || "N/A"}</td>
                  <td className="max-w-xs truncate">{nc.description}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        nc.severity === "critica"
                          ? "bg-red-100 text-red-800"
                          : nc.severity === "alta"
                          ? "bg-orange-100 text-orange-800"
                          : nc.severity === "media"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {nc.severity}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        nc.status === "resuelta"
                          ? "bg-green-100 text-green-800"
                          : nc.status === "cerrada"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {nc.status}
                    </span>
                  </td>
                  <td>{new Date(nc.createdAt).toLocaleDateString("es-PE")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de creación */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Reportar No Conformidad</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto (Opcional)
                </label>
                <select
                  className="input w-full"
                  value={formData.productId}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      productId: e.target.value,
                      productionRecordId: "",
                    });
                  }}
                >
                  <option value="">Seleccione un producto (opcional)</option>
                  {products?.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registro de Producción (Opcional)
                </label>
                <select
                  className="input w-full"
                  value={formData.productionRecordId}
                  onChange={(e) =>
                    setFormData({ ...formData, productionRecordId: e.target.value })
                  }
                  disabled={!formData.productId}
                >
                  <option value="">
                    {formData.productId
                      ? "Seleccione un registro de producción (opcional)"
                      : "Primero seleccione un producto"}
                  </option>
                  {productionRecordsData?.data?.map((record) => (
                    <option key={record.id} value={record.id}>
                      Lote: {record.lotNumber} -{" "}
                      {new Date(record.productionDate).toLocaleDateString("es-PE")} - Turno:{" "}
                      {record.shift}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  className="input w-full"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describa la no conformidad..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severidad *
                </label>
                <select
                  className="input w-full"
                  value={formData.severity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      severity: e.target.value as "baja" | "media" | "alta" | "critica",
                    })
                  }
                  required
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      productId: "",
                      productionRecordId: "",
                      description: "",
                      severity: "media",
                    });
                    if (location.state) {
                      window.history.replaceState({}, document.title);
                    }
                  }}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createMutation.isLoading}
                >
                  {createMutation.isLoading ? "Reportando..." : "Reportar No Conformidad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NonConformities;
