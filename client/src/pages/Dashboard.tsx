import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { dashboardAPI, productAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Product } from '../types';

interface DashboardMetrics {
  production: {
    totalProduced: number;
    approvalRate: number;
  };
  quality: {
    avgWastePercentage: number;
  };
  alerts: {
    active: number;
  };
  productionByShift: Array<{
    shift: string;
    totalProduced: number;
  }>;
  defects: Array<{
    type: string;
    quantity: number;
  }>;
}

interface TrendData {
  date: string;
  totalProduced: number;
  totalApproved: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    productId: '',
  });

  const { data: products } = useQuery<Product[]>('products', () =>
    productAPI.getAll({ active: true }).then((res) => res.data.data)
  );

  const { data: metrics, isLoading } = useQuery<DashboardMetrics>(
    ['dashboard-metrics', filters],
    () =>
      dashboardAPI
        .getMetrics({
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          productId: filters.productId ? parseInt(filters.productId) : undefined,
        })
        .then((res) => res.data.data),
    { refetchInterval: 30000 }
  );

  const { data: trends } = useQuery<TrendData[]>(
    ['dashboard-trends', filters],
    () =>
      dashboardAPI
        .getTrends({
          groupBy: 'day',
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          productId: filters.productId ? parseInt(filters.productId) : undefined,
        })
        .then((res) => res.data.data)
  );

  const handleExport = () => {
    // Crear CSV simple
    const csvContent = [
      ['Métrica', 'Valor'],
      ['Total Producido', metrics?.production?.totalProduced || 0],
      ['Tasa de Aprobación', `${metrics?.production?.approvalRate || 0}%`],
      ['Merma Promedio', `${metrics?.quality?.avgWastePercentage || 0}%`],
      ['Alertas Activas', metrics?.alerts?.active || 0],
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte-dashboard-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando métricas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Bienvenido, {user?.fullName}
          </p>
        </div>
        <button onClick={handleExport} className="btn btn-secondary">
          📥 Exportar Reporte
        </button>
      </div>

      {/* Filtros */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              className="input w-full"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              className="input w-full"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Producto
            </label>
            <select
              className="input w-full"
              value={filters.productId}
              onChange={(e) => setFilters({ ...filters, productId: e.target.value })}
            >
              <option value="">Todos los productos</option>
              {products?.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {(filters.startDate || filters.endDate || filters.productId) && (
          <button
            onClick={() => setFilters({ startDate: '', endDate: '', productId: '' })}
            className="mt-4 btn btn-secondary text-sm"
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/dashboard/quality/register"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <h3 className="text-sm font-medium text-gray-500">Total Producido</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {metrics?.production?.totalProduced?.toLocaleString() || 0}
          </p>
          <p className="mt-1 text-xs text-gray-400">Click para ver detalles</p>
        </Link>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Tasa de Aprobación</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {metrics?.production?.approvalRate || 0}%
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Merma Promedio</h3>
          <p className="mt-2 text-3xl font-bold text-orange-600">
            {metrics?.quality?.avgWastePercentage || 0}%
          </p>
        </div>
        <Link
          to="/dashboard/alerts"
          className="card hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-red-500"
        >
          <h3 className="text-sm font-medium text-gray-500">Alertas Activas</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {metrics?.alerts?.active || 0}
          </p>
          <p className="mt-1 text-xs text-gray-400">Click para ver alertas</p>
        </Link>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Tendencia de Producción</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalProduced" stroke="#3b82f6" name="Producido" />
              <Line type="monotone" dataKey="totalApproved" stroke="#10b981" name="Aprobado" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Producción por Turno</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics?.productionByShift || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="shift" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalProduced" fill="#3b82f6" name="Total Producido" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Defectos por tipo */}
      {metrics?.defects && metrics.defects.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Defectos por Tipo</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Tipo de Defecto</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {metrics.defects.map((defect, index) => (
                  <tr key={index}>
                    <td className="capitalize">{defect.type}</td>
                    <td>{defect.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

