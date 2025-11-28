import { useState, FormEvent, ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { qualityAPI, productAPI } from '../services/api';
import toast from 'react-hot-toast';
import { SHIFTS, DEFECT_TYPES } from '../utils/constants';
import type { Product } from '../types';

interface DefectForm {
  defectType: string;
  quantity: number;
  description: string;
}

interface QualityFormData {
  productId: string;
  lotNumber: string;
  productionDate: string;
  shift: string;
  productionLine: string;
  totalProduced: number | string;
  totalApproved: number | string;
  totalRejected: number | string;
  weight: string;
  diameter: string;
  height: string;
  width: string;
  defects: DefectForm[];
  productionRecordId?: number;
}

const QualityRegister = () => {
  const [step, setStep] = useState<number>(1);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [showEditProduction, setShowEditProduction] = useState<boolean>(false);
  const [formData, setFormData] = useState<QualityFormData>({
    productId: '',
    lotNumber: '',
    productionDate: new Date().toISOString().split('T')[0],
    shift: SHIFTS.MORNING,
    productionLine: '',
    totalProduced: 0,
    totalApproved: 0,
    totalRejected: 0,
    weight: '',
    diameter: '',
    height: '',
    width: '',
    defects: [],
  });

  const queryClient = useQueryClient();

  const { data: products } = useQuery<Product[]>('products', () =>
    productAPI.getAll({ active: true }).then((res) => res.data.data)
  );

  // Obtener historial de controles para el mismo lote
  const { data: historyData } = useQuery(
    ['quality-controls-history', formData.lotNumber],
    () =>
      qualityAPI
        .getQualityControls({
          productionRecordId: formData.productionRecordId,
        })
        .then((res) => res.data),
    { enabled: !!formData.productionRecordId && step === 2 }
  );

  const createProductionRecordMutation = useMutation(
    (data: any) => qualityAPI.createProductionRecord(data),
    {
      onSuccess: (response: any) => {
        toast.success('Registro de producción creado');
        setFormData((prev) => ({
          ...prev,
          productionRecordId: response.data.data.id,
        }));
        setStep(2);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error al crear registro');
      },
    }
  );

  const createQualityControlMutation = useMutation(
    (data: any) => qualityAPI.createQualityControl(data),
    {
      onSuccess: () => {
        toast.success('Control de calidad registrado');
        queryClient.invalidateQueries('dashboard-metrics');
        setFormData({
          productId: '',
          lotNumber: '',
          productionDate: new Date().toISOString().split('T')[0],
          shift: SHIFTS.MORNING,
          productionLine: '',
          totalProduced: 0,
          totalApproved: 0,
          totalRejected: 0,
          weight: '',
          diameter: '',
          height: '',
          width: '',
          defects: [],
        });
        setStep(1);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error al registrar control');
      },
    }
  );

  const handleProductionSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    const totalProduced = parseInt(formData.totalProduced.toString());
    const totalApproved = parseInt(formData.totalApproved.toString());
    const totalRejected = parseInt(formData.totalRejected.toString());

    // Validaciones
    if (totalProduced <= 0) {
      toast.error('El total producido debe ser mayor a 0');
      return;
    }

    if (totalApproved < 0 || totalRejected < 0) {
      toast.error('Los valores de aprobados y rechazados no pueden ser negativos');
      return;
    }

    if (totalApproved + totalRejected > totalProduced) {
      toast.error(
        `La suma de aprobados (${totalApproved}) y rechazados (${totalRejected}) no puede ser mayor que el total producido (${totalProduced})`
      );
      return;
    }

    createProductionRecordMutation.mutate({
      productId: parseInt(formData.productId),
      lotNumber: formData.lotNumber,
      productionDate: formData.productionDate,
      shift: formData.shift,
      productionLine: formData.productionLine,
      totalProduced,
      totalApproved,
      totalRejected,
    });
  };

  const handleQualitySubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    // Validar que hay al menos un defecto si se rechazaron productos
    const totalRejected = parseInt(formData.totalRejected.toString());
    if (totalRejected > 0 && formData.defects.length === 0) {
      toast.error('Debe registrar al menos un defecto si hay productos rechazados');
      return;
    }

    // Mostrar resumen antes de enviar
    setShowSummary(true);
  };

  const confirmQualitySubmit = (): void => {
    createQualityControlMutation.mutate({
      productionRecordId: formData.productionRecordId,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      diameter: formData.diameter ? parseFloat(formData.diameter) : null,
      height: formData.height ? parseFloat(formData.height) : null,
      width: formData.width ? parseFloat(formData.width) : null,
      approved: Number(formData.totalApproved) > Number(formData.totalRejected),
      defects: formData.defects,
    });
    setShowSummary(false);
  };

  const addDefect = (): void => {
    setFormData((prev) => ({
      ...prev,
      defects: [...prev.defects, { defectType: '', quantity: 0, description: '' }],
    }));
  };

  const updateDefect = (index: number, field: keyof DefectForm, value: string | number): void => {
    setFormData((prev) => {
      const newDefects = [...prev.defects];
      newDefects[index] = { ...newDefects[index], [field]: value };
      return { ...prev, defects: newDefects };
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Registro de Calidad</h1>
        <p className="mt-1 text-sm text-gray-500">
          Registre los datos de producción y control de calidad
        </p>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-300'
              }`}
            >
              1
            </div>
            <div className="ml-2 text-sm font-medium">Registro de Producción</div>
          </div>
          {step === 2 && (
            <div className="mt-2 ml-10">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white">
                  2
                </div>
                <div className="ml-2 text-sm font-medium">Control de Calidad</div>
              </div>
            </div>
          )}
        </div>

        {step === 1 ? (
          <form onSubmit={handleProductionSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto *
                </label>
                <select
                  className="input"
                  value={formData.productId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, productId: e.target.value })}
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
                  Número de Lote *
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.lotNumber}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, lotNumber: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Producción *
                </label>
                <input
                  type="date"
                  className="input"
                  value={formData.productionDate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, productionDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Turno *
                </label>
                <select
                  className="input"
                  value={formData.shift}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, shift: e.target.value })}
                  required
                >
                  <option value={SHIFTS.MORNING}>Mañana</option>
                  <option value={SHIFTS.AFTERNOON}>Tarde</option>
                  <option value={SHIFTS.NIGHT}>Noche</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Línea de Producción
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.productionLine}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, productionLine: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Producido *
                </label>
                <input
                  type="number"
                  className="input"
                  value={formData.totalProduced}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, totalProduced: e.target.value })}
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Aprobado *
                </label>
                <input
                  type="number"
                  className="input"
                  value={formData.totalApproved}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, totalApproved: e.target.value })}
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Rechazado *
                </label>
                <input
                  type="number"
                  className="input"
                  value={formData.totalRejected}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, totalRejected: e.target.value })}
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">
                Continuar a Control de Calidad
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Resumen del registro de producción */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">Resumen del Registro de Producción</h3>
                <button
                  type="button"
                  onClick={() => setShowEditProduction(true)}
                  className="btn btn-secondary text-xs"
                >
                  Editar
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Producto:</span>
                  <p className="font-medium">
                    {products?.find((p) => p.id.toString() === formData.productId)?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Lote:</span>
                  <p className="font-medium">{formData.lotNumber}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total Producido:</span>
                  <p className="font-medium">{formData.totalProduced}</p>
                </div>
                <div>
                  <span className="text-gray-600">Aprobados/Rechazados:</span>
                  <p className="font-medium">
                    {formData.totalApproved} / {formData.totalRejected}
                  </p>
                </div>
              </div>
            </div>

            {/* Historial de controles para el mismo lote */}
            {historyData?.data && historyData.data.length > 0 && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-yellow-800">
                  ⚠️ Ya existe un control de calidad para este registro
                </h4>
                <p className="text-xs text-yellow-700">
                  Cada registro de producción solo puede tener un control de calidad.
                </p>
              </div>
            )}

            <form onSubmit={handleQualitySubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso (g)
                </label>
                <input
                  type="number"
                  step="0.001"
                  className="input"
                  value={formData.weight}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diámetro (mm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.diameter}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, diameter: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Altura (mm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.height}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, height: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ancho (mm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.width}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, width: e.target.value })}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Defectos
                </label>
                <button
                  type="button"
                  onClick={addDefect}
                  className="btn btn-secondary text-sm"
                >
                  + Agregar Defecto
                </button>
              </div>

              {formData.defects.map((defect, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                  <select
                    className="input"
                    value={defect.defectType}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => updateDefect(index, 'defectType', e.target.value)}
                  >
                    <option value="">Tipo de defecto</option>
                    {Object.values(DEFECT_TYPES).map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="input"
                    placeholder="Cantidad"
                    value={defect.quantity}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateDefect(index, 'quantity', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <input
                    type="text"
                    className="input"
                    placeholder="Descripción"
                    value={defect.description}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateDefect(index, 'description', e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-secondary"
              >
                Volver
              </button>
              <button type="submit" className="btn btn-primary">
                Revisar y Confirmar
              </button>
            </div>
          </form>

          {/* Modal de resumen */}
          {showSummary && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Resumen del Control de Calidad</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Mediciones</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {formData.weight && <p>Peso: {formData.weight} g</p>}
                      {formData.diameter && <p>Diámetro: {formData.diameter} mm</p>}
                      {formData.height && <p>Altura: {formData.height} mm</p>}
                      {formData.width && <p>Ancho: {formData.width} mm</p>}
                    </div>
                  </div>
                  {formData.defects.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Defectos</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {formData.defects.map((defect, index) => (
                          <li key={index}>
                            {defect.defectType}: {defect.quantity} unidades
                            {defect.description && ` - ${defect.description}`}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-sm font-medium">
                        Total de defectos: {formData.defects.reduce((sum, d) => sum + d.quantity, 0)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowSummary(false)}
                    className="btn btn-secondary"
                  >
                    Volver a Editar
                  </button>
                  <button
                    type="button"
                    onClick={confirmQualitySubmit}
                    className="btn btn-primary"
                    disabled={createQualityControlMutation.isLoading}
                  >
                    {createQualityControlMutation.isLoading ? 'Registrando...' : 'Confirmar y Registrar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de edición de producción */}
          {showEditProduction && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Editar Registro de Producción</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setShowEditProduction(false);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Producido *
                      </label>
                      <input
                        type="number"
                        className="input"
                        value={formData.totalProduced}
                        onChange={(e) => setFormData({ ...formData, totalProduced: e.target.value })}
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Aprobado *
                      </label>
                      <input
                        type="number"
                        className="input"
                        value={formData.totalApproved}
                        onChange={(e) => setFormData({ ...formData, totalApproved: e.target.value })}
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Rechazado *
                      </label>
                      <input
                        type="number"
                        className="input"
                        value={formData.totalRejected}
                        onChange={(e) => setFormData({ ...formData, totalRejected: e.target.value })}
                        required
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowEditProduction(false)}
                      className="btn btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
        )}
      </div>
    </div>
  );
};

export default QualityRegister;

