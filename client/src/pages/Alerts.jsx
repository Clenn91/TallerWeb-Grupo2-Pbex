import { useQuery, useMutation, useQueryClient } from 'react-query';
import { alertAPI } from '../services/api';
import toast from 'react-hot-toast';

const Alerts = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery('alerts', () =>
    alertAPI.getAll({ status: 'activa' }).then((res) => res.data)
  );

  const resolveMutation = useMutation(
    ({ id, notes }) => alertAPI.resolve(id, notes),
    {
      onSuccess: () => {
        toast.success('Alerta resuelta');
        queryClient.invalidateQueries('alerts');
      },
    }
  );

  const dismissMutation = useMutation(
    (id) => alertAPI.dismiss(id),
    {
      onSuccess: () => {
        toast.success('Alerta descartada');
        queryClient.invalidateQueries('alerts');
      },
    }
  );

  if (isLoading) {
    return <div className="text-center py-8">Cargando alertas...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Alertas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Alertas activas del sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data?.map((alert) => (
          <div key={alert.id} className="card border-l-4 border-red-500">
            <h3 className="font-semibold text-lg mb-2">{alert.product?.name}</h3>
            <p className="text-sm text-gray-600 mb-2">
              Lote: {alert.productionRecord?.lotNumber}
            </p>
            <p className="text-sm">
              <span className="font-medium">Umbral:</span> {alert.threshold}%
            </p>
            <p className="text-sm">
              <span className="font-medium">Valor Actual:</span>{' '}
              <span className="text-red-600 font-bold">{alert.actualValue}%</span>
            </p>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => {
                  const notes = prompt('Notas de resolución:');
                  if (notes) {
                    resolveMutation.mutate({ id: alert.id, notes });
                  }
                }}
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
          </div>
        ))}

        {(!data?.data || data.data.length === 0) && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No hay alertas activas
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;

