import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { alertAPI, productAPI } from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { USER_ROLES } from "../utils/constants";
import type { Alert, Product } from "../types";

const Alerts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: "activa" as "activa" | "resuelta" | "descartada" | "",
    productId: "",
    alertType: "",
  });
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const { data, isLoading } = useQuery<{ data: Alert[] }>(
    ["alerts", filters],
    () => alertAPI.getAll(filters).then((res) => res.data)
  );

  const { data: products } = useQuery<Product[]>("products", () =>
    productAPI.getAll({ active: true }).then((res) => res.data.data)
  );

  const resolveMutation = useMutation(
    ({ id, notes }: { id: number; notes: string }) =>
      alertAPI.resolve(id, notes),
    {
      onSuccess: () => {
        toast.success("Alerta resuelta");
        queryClient.invalidateQueries("alerts");
        setShowResolveModal(false);
        setSelectedAlert(null);
        setResolutionNotes("");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Error al resolver alerta"
        );
      },
    }
  );

  const dismissMutation = useMutation((id: number) => alertAPI.dismiss(id), {
    onSuccess: () => {
      toast.success("Alerta descartada");
      queryClient.invalidateQueries("alerts");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al descartar alerta");
    },
  });

  const canResolve =
    user?.role === USER_ROLES.SUPERVISOR || user?.role === USER_ROLES.ADMIN;

  const handleCreateNonConformity = (alert: Alert) => {
    navigate("/dashboard/non-conformities", {
      state: {
        productId: alert.productId,
        productionRecordId: alert.productionRecordId,
        description: `Alerta de ${
          alert.alertType === "waste_threshold" ? "merma" : alert.alertType
        }: Valor actual ${alert.actualValue}% supera el umbral de ${
          alert.threshold
        }%. Producto: ${alert.product?.name}. Lote: ${
          alert.productionRecord?.lotNumber || "N/A"
        }`,
        severity:
          alert.actualValue > alert.threshold * 1.5
            ? "critica"
            : alert.actualValue > alert.threshold * 1.2
            ? "alta"
            : "media",
      },
    });
  };

  const handleResolveClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowResolveModal(true);
  };

  const handleConfirmResolve = () => {
    if (!selectedAlert) return;
    if (!resolutionNotes.trim()) {
      toast.error("Debe proporcionar notas de resolución");
      return;
    }
    resolveMutation.mutate({ id: selectedAlert.id, notes: resolutionNotes });
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando alertas...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Alertas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestión de alertas del sistema
        </p>
      </div>

      {/* Filtros */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              className="input w-full"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value as any })
              }
            >
              <option value="">Todas</option>
              <option value="activa">Activas</option>
              <option value="resuelta">Resueltas</option>
              <option value="descartada">Descartadas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Producto
            </label>
            <select
              className="input w-full"
              value={filters.productId}
              onChange={(e) =>
                setFilters({ ...filters, productId: e.target.value })
              }
            >
              <option value="">Todos los productos</option>
              {products?.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Alerta
            </label>
            <select
              className="input w-full"
              value={filters.alertType}
              onChange={(e) =>
                setFilters({ ...filters, alertType: e.target.value })
              }
            >
              <option value="">Todos los tipos</option>
              <option value="waste_threshold">Umbral de Merma</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data?.map((alert) => (
          <div
            key={alert.id}
            className={`card border-l-4 ${
              alert.status === "activa"
                ? "border-red-500"
                : alert.status === "resuelta"
                ? "border-green-500"
                : "border-gray-400"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">
                {alert.product?.name || "N/A"}
              </h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  alert.status === "activa"
                    ? "bg-red-100 text-red-800"
                    : alert.status === "resuelta"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {alert.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Lote:</span>{" "}
              {alert.productionRecord?.lotNumber || "N/A"}
            </p>
            <p className="text-sm mb-1">
              <span className="font-medium">Tipo:</span>{" "}
              {alert.alertType === "waste_threshold"
                ? "Umbral de Merma"
                : alert.alertType}
            </p>
            <p className="text-sm mb-1">
              <span className="font-medium">Umbral:</span> {alert.threshold}%
            </p>
            <p className="text-sm mb-3">
              <span className="font-medium">Valor Actual:</span>{" "}
              <span
                className={`font-bold ${
                  alert.actualValue > alert.threshold
                    ? "text-red-600"
                    : "text-orange-600"
                }`}
              >
                {alert.actualValue}%
              </span>
            </p>
            {alert.status === "resuelta" && alert.resolver && (
              <p className="text-xs text-gray-500 mb-2">
                Resuelta por: {alert.resolver.fullName} el{" "}
                {new Date(alert.resolvedAt || "").toLocaleDateString("es-PE")}
              </p>
            )}
            {canResolve && alert.status === "activa" && (
              <div className="mt-4 space-y-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleResolveClick(alert)}
                    className="btn btn-primary text-xs flex-1"
                  >
                    Resolver
                  </button>
                  <button
                    onClick={() => dismissMutation.mutate(alert.id)}
                    className="btn btn-secondary text-xs flex-1"
                  >
                    Descartar
                  </button>
                </div>
                <button
                  onClick={() => handleCreateNonConformity(alert)}
                  className="btn btn-warning text-xs w-full"
                >
                  Crear No Conformidad
                </button>
              </div>
            )}
          </div>
        ))}

        {(!data?.data || data.data.length === 0) && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No hay alertas{" "}
            {filters.status ? `con estado "${filters.status}"` : ""}
          </div>
        )}
      </div>

      {/* Modal de resolución */}
      {showResolveModal && selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Resolver Alerta</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Producto:</span>{" "}
                {selectedAlert.product?.name || "N/A"}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Lote:</span>{" "}
                {selectedAlert.productionRecord?.lotNumber || "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Valor Actual:</span>{" "}
                <span className="text-red-600 font-bold">
                  {selectedAlert.actualValue}%
                </span>{" "}
                (Umbral: {selectedAlert.threshold}%)
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas de Resolución *
              </label>
              <textarea
                className="input w-full"
                rows={4}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Describa las acciones tomadas para resolver esta alerta..."
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowResolveModal(false);
                  setSelectedAlert(null);
                  setResolutionNotes("");
                }}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmResolve}
                className="btn btn-primary"
                disabled={resolveMutation.isLoading}
              >
                {resolveMutation.isLoading
                  ? "Resolviendo..."
                  : "Confirmar Resolución"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
