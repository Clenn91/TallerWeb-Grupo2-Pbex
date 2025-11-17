import { useQuery } from 'react-query';
import { nonConformityAPI } from '../services/api';

const NonConformities = () => {
  const { data, isLoading } = useQuery('non-conformities', () =>
    nonConformityAPI.getAll().then((res) => res.data)
  );

  if (isLoading) {
    return <div className="text-center py-8">Cargando no conformidades...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">No Conformidades</h1>
        <p className="mt-1 text-sm text-gray-500">
          Registro de no conformidades
        </p>
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
                  <td>{nc.product?.name || 'N/A'}</td>
                  <td className="max-w-xs truncate">{nc.description}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        nc.severity === 'critica'
                          ? 'bg-red-100 text-red-800'
                          : nc.severity === 'alta'
                          ? 'bg-orange-100 text-orange-800'
                          : nc.severity === 'media'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {nc.severity}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        nc.status === 'resuelta'
                          ? 'bg-green-100 text-green-800'
                          : nc.status === 'cerrada'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {nc.status}
                    </span>
                  </td>
                  <td>{new Date(nc.createdAt).toLocaleDateString('es-PE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NonConformities;

