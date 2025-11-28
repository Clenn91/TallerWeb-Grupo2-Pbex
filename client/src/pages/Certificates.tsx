import { useState, FormEvent, ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { certificateAPI, qualityAPI, productAPI } from '../services/api';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES } from '../utils/constants';
import type { Certificate, ProductionRecord, Product } from '../types';

const Certificates = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [formData, setFormData] = useState({
    productId: '',
    productionRecordId: '',
    qualityControlId: '',
  });

  const { data, isLoading } = useQuery<{ data: Certificate[] }>('certificates', () =>
    certificateAPI.getAll().then((res) => res.data)
  );

  // Obtener productos
  const { data: products } = useQuery<Product[]>('products', () =>
    productAPI.getAll({ active: true }).then((res) => res.data.data)
  );

  // Obtener registros de producción con control de calidad
  const { data: productionRecordsData } = useQuery<{ data: ProductionRecord[] }>(
    ['production-records-with-qc', formData.productId],
    () => qualityAPI.getProductionRecords({ 
      productId: formData.productId ? parseInt(formData.productId) : undefined,
      hasQualityControl: true,
      limit: 100 
    }).then((res) => res.data),
    { enabled: !!formData.productId }
  );

  // Obtener controles de calidad para el registro seleccionado
  const { data: qualityControlsData } = useQuery(
    ['quality-controls', formData.productionRecordId],
    () => qualityAPI.getQualityControls({ 
      productionRecordId: formData.productionRecordId ? parseInt(formData.productionRecordId) : undefined 
    }).then((res) => res.data),
    { enabled: !!formData.productionRecordId }
  );

  const approveMutation = useMutation(
    (id: number) => certificateAPI.approve(id),
    {
      onSuccess: () => {
        toast.success('Certificado aprobado');
        queryClient.invalidateQueries('certificates');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error al aprobar certificado');
      },
    }
  );

  const rejectMutation = useMutation(
    ({ id, reason }: { id: number; reason: string }) => certificateAPI.reject(id, reason),
    {
      onSuccess: () => {
        toast.success('Certificado rechazado');
        queryClient.invalidateQueries('certificates');
        setShowRejectModal(false);
        setSelectedCertificate(null);
        setRejectionReason('');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error al rechazar certificado');
      },
    }
  );

  const handleRejectClick = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error('Debe proporcionar un motivo de rechazo');
      return;
    }
    if (!selectedCertificate) return;
    rejectMutation.mutate({ id: selectedCertificate.id, reason: rejectionReason });
  };

  const createMutation = useMutation(
    (data: any) => certificateAPI.create(data),
    {
      onSuccess: () => {
        toast.success('Certificado creado exitosamente');
        queryClient.invalidateQueries('certificates');
        setShowCreateModal(false);
        setFormData({ productId: '', productionRecordId: '', qualityControlId: '' });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error al crear certificado');
      },
    }
  );

  const handleCreateSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.productionRecordId) {
      toast.error('Debe seleccionar un registro de producción');
      return;
    }
    createMutation.mutate({
      productId: parseInt(formData.productId),
      productionRecordId: parseInt(formData.productionRecordId),
      qualityControlId: formData.qualityControlId ? parseInt(formData.qualityControlId) : null,
    });
  };

  const canApprove = user?.role === USER_ROLES.SUPERVISOR || user?.role === USER_ROLES.ADMIN;
  const canCreate = user?.role === USER_ROLES.ASSISTANT || user?.role === USER_ROLES.SUPERVISOR || user?.role === USER_ROLES.ADMIN;

  const handleDownloadPDF = async (certificate: Certificate) => {
    if (!certificate.pdfPath) {
      toast.error('El PDF no está disponible');
      return;
    }
    
    try {
      // Usar el endpoint específico de descarga que maneja correctamente el PDF
      const response = await certificateAPI.getById(certificate.id);
      const cert = response.data.data;
      
      if (!cert || cert.status !== 'aprobado') {
        toast.error('El certificado debe estar aprobado para descargar el PDF');
        return;
      }
      
      // Usar la instancia api que tiene el interceptor configurado para agregar el token
      // El interceptor automáticamente agregará el token de localStorage
      const pdfResponse = await api.get(`/certificates/${certificate.id}/download`, {
        responseType: 'blob',
      });
      
      // Verificar que la respuesta sea un blob válido
      if (!(pdfResponse.data instanceof Blob)) {
        throw new Error('La respuesta del servidor no es un archivo válido');
      }
      
      // Verificar que el blob tenga datos
      if (pdfResponse.data.size === 0) {
        throw new Error('El archivo PDF está vacío');
      }
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(pdfResponse.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${certificate.code}.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Limpiar después de un breve delay
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('PDF descargado exitosamente');
    } catch (error: any) {
      console.error('Error al descargar PDF:', error);
      if (error.response?.status === 401) {
        toast.error('No autorizado. Por favor, inicia sesión nuevamente.');
      } else if (error.response?.status === 404) {
        toast.error('El archivo PDF no se encontró en el servidor.');
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'El certificado no está aprobado');
      } else {
        toast.error(error.response?.data?.message || error.message || 'Error al descargar el PDF');
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando certificados...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificados de Calidad</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestión de certificados de calidad
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            + Nuevo Certificado
          </button>
        )}
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
                <th>Acciones</th>
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
                  <td>
                    {canApprove && certificate.status === 'pendiente' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => approveMutation.mutate(certificate.id)}
                          className="btn btn-primary text-xs"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleRejectClick(certificate)}
                          className="btn btn-danger text-xs"
                        >
                          Rechazar
                        </button>
                      </div>
                    )}
                    {certificate.status === 'aprobado' && certificate.pdfPath && (
                      <button
                        onClick={() => handleDownloadPDF(certificate)}
                        className="btn btn-secondary text-xs"
                        title="Descargar PDF"
                      >
                        📥 Descargar PDF
                      </button>
                    )}
                    {certificate.status === 'aprobado' && !certificate.pdfPath && (
                      <span className="text-xs text-gray-500">PDF no disponible</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de rechazo */}
      {showRejectModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Rechazar Certificado</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Código:</span> {selectedCertificate.code}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Producto:</span> {selectedCertificate.product?.name || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Lote:</span> {selectedCertificate.productionRecord?.lotNumber || 'N/A'}
              </p>
            </div>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo del Rechazo *
                </label>
                <textarea
                  className="input w-full"
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Describa el motivo del rechazo..."
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedCertificate(null);
                    setRejectionReason('');
                  }}
                  className="btn btn-secondary"
                  disabled={rejectMutation.isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={rejectMutation.isLoading}
                >
                  {rejectMutation.isLoading ? 'Rechazando...' : 'Confirmar Rechazo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de creación */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Crear Nuevo Certificado</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto *
                </label>
                <select
                  className="input w-full"
                  value={formData.productId}
                  onChange={(e) => {
                    setFormData({
                      productId: e.target.value,
                      productionRecordId: '',
                      qualityControlId: '',
                    });
                  }}
                  required
                >
                  <option value="">Seleccione un producto</option>
                  {products?.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registro de Producción *
                </label>
                <select
                  className="input w-full"
                  value={formData.productionRecordId}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      productionRecordId: e.target.value,
                      qualityControlId: '',
                    });
                  }}
                  required
                  disabled={!formData.productId}
                >
                  <option value="">
                    {formData.productId
                      ? 'Seleccione un registro de producción'
                      : 'Primero seleccione un producto'}
                  </option>
                  {productionRecordsData?.data?.map((record) => (
                    <option key={record.id} value={record.id}>
                      Lote: {record.lotNumber} - {new Date(record.productionDate).toLocaleDateString('es-PE')} - 
                      Turno: {record.shift}
                    </option>
                  ))}
                </select>
                {formData.productId && (!productionRecordsData?.data || productionRecordsData.data.length === 0) && (
                  <p className="text-sm text-red-600 mt-1">
                    No hay registros de producción con control de calidad para este producto
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Control de Calidad (Opcional)
                </label>
                <select
                  className="input w-full"
                  value={formData.qualityControlId}
                  onChange={(e) =>
                    setFormData({ ...formData, qualityControlId: e.target.value })
                  }
                  disabled={!formData.productionRecordId}
                >
                  <option value="">
                    {formData.productionRecordId
                      ? 'Seleccione un control de calidad (opcional)'
                      : 'Primero seleccione un registro de producción'}
                  </option>
                  {qualityControlsData?.data?.map((control: any) => (
                    <option key={control.id} value={control.id}>
                      Control #{control.id} - Merma: {control.wastePercentage}% - 
                      {control.approved ? 'Aprobado' : 'Rechazado'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ productId: '', productionRecordId: '', qualityControlId: '' });
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
                  {createMutation.isLoading ? 'Creando...' : 'Crear Certificado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;

