import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { qualityAPI, productAPI } from '../services/api';
import toast from 'react-hot-toast';
import { SHIFTS, DEFECT_TYPES } from '../utils/constants';

const QualityRegister = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
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

  const { data: products } = useQuery('products', () =>
    productAPI.getAll({ active: true }).then((res) => res.data.data)
  );

  const createProductionRecordMutation = useMutation(
    (data) => qualityAPI.createProductionRecord(data),
    {
      onSuccess: (response) => {
        toast.success('Registro de producción creado');
        setFormData((prev) => ({
          ...prev,
          productionRecordId: response.data.data.id,
        }));
        setStep(2);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al crear registro');
      },
    }
  );

  const createQualityControlMutation = useMutation(
    (data) => qualityAPI.createQualityControl(data),
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
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al registrar control');
      },
    }
  );

  const handleProductionSubmit = (e) => {
    e.preventDefault();
    createProductionRecordMutation.mutate({
      productId: parseInt(formData.productId),
      lotNumber: formData.lotNumber,
      productionDate: formData.productionDate,
      shift: formData.shift,
      productionLine: formData.productionLine,
      totalProduced: parseInt(formData.totalProduced),
      totalApproved: parseInt(formData.totalApproved),
      totalRejected: parseInt(formData.totalRejected),
    });
  };

  const handleQualitySubmit = (e) => {
    e.preventDefault();
    createQualityControlMutation.mutate({
      productionRecordId: formData.productionRecordId,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      diameter: formData.diameter ? parseFloat(formData.diameter) : null,
      height: formData.height ? parseFloat(formData.height) : null,
      width: formData.width ? parseFloat(formData.width) : null,
      approved: formData.totalApproved > formData.totalRejected,
      defects: formData.defects,
    });
  };

  const addDefect = () => {
    setFormData((prev) => ({
      ...prev,
      defects: [...prev.defects, { defectType: '', quantity: 0, description: '' }],
    }));
  };

  const updateDefect = (index, field, value) => {
    setFormData((prev) => {
      const newDefects = [...prev.defects];
      newDefects[index][field] = value;
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
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, productionLine: e.target.value })}
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

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">
                Continuar a Control de Calidad
              </button>
            </div>
          </form>
        ) : (
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
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, diameter: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, width: e.target.value })}
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
                    onChange={(e) => updateDefect(index, 'defectType', e.target.value)}
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
                    onChange={(e) => updateDefect(index, 'quantity', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <input
                    type="text"
                    className="input"
                    placeholder="Descripción"
                    value={defect.description}
                    onChange={(e) => updateDefect(index, 'description', e.target.value)}
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
                Guardar Control de Calidad
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default QualityRegister;

