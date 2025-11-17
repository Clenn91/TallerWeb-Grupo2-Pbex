import { useQuery } from 'react-query';
import { dashboardAPI } from '../services/api';
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

const Dashboard = () => {
  const { user } = useAuth();

  const { data: metrics, isLoading } = useQuery(
    'dashboard-metrics',
    () => dashboardAPI.getMetrics().then((res) => res.data.data),
    { refetchInterval: 30000 }
  );

  const { data: trends } = useQuery(
    'dashboard-trends',
    () => dashboardAPI.getTrends({ groupBy: 'day' }).then((res) => res.data.data)
  );

  if (isLoading) {
    return <div className="text-center py-8">Cargando métricas...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Bienvenido, {user?.fullName}
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Total Producido</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {metrics?.production?.totalProduced?.toLocaleString() || 0}
          </p>
        </div>
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
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Alertas Activas</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {metrics?.alerts?.active || 0}
          </p>
        </div>
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

