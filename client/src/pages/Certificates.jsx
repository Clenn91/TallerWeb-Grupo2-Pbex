import { useQuery, useMutation, useQueryClient } from 'react-query';
import { certificateAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES } from '../utils/constants';

const Certificates = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery('certificates', () =>
    certificateAPI.getAll().then((res) => res.data)
  );

  const approveMutation = useMutation(
    (id) => certificateAPI.approve(id),
    {
      onSuccess: () => {
        toast.success('Certificado aprobado');
        queryClient.invalidateQueries('certificates');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al aprobar certificado');
      },
    }
  );

  const rejectMutation = useMutation(
    ({ id, reason }) => certificateAPI.reject(id, reason),
    {
      onSuccess: () => {
        toast.success('Certificado rechazado');
        queryClient.invalidateQueries('certificates');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al rechazar certificado');
      },
    }
  );

  const canApprove = [USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN].includes(user?.role);

  if (isLoading) {
    return <div className="text-center py-8">Cargando certificados...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Certificados de Calidad</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestión de certificados de calidad
        </p>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Lote</th>
                <th>Estado</th>
                <th>Fecha</th>
                {canApprove && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((certificate) => (
                <tr key={certificate.id}>
                  <td>{certificate.code}</td>
                  <td>{certificate.product?.name}</td>
                  <td>{certificate.productionRecord?.lotNumber}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        certificate.status === 'aprobado'
                          ? 'bg-green-100 text-green-800'
                          : certificate.status === 'rechazado'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {certificate.status}
                    </span>
                  </td>
                  <td>
                    {new Date(certificate.createdAt).toLocaleDateString('es-PE')}
                  </td>
                  {canApprove && certificate.status === 'pendiente' && (
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => approveMutation.mutate(certificate.id)}
                          className="btn btn-primary text-xs"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Motivo del rechazo:');
                            if (reason) {
                              rejectMutation.mutate({ id: certificate.id, reason });
                            }
                          }}
                          className="btn btn-danger text-xs"
                        >
                          Rechazar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Certificates;

