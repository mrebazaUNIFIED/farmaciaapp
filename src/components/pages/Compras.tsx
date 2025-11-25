'use client';

import React, { useState } from 'react';
import PageBreadcrumb from '../common/PageBreadCrumb';
import ComponentCard from '../common/ComponentCard';
import DynamicTable, { ColumnDef } from '../tables/DynamicTable';
import Badge from '../ui/badge/Badge';
import { useCompras } from '@/hooks/useCompras';
import { useProveedores } from '@/hooks/useProveedores';
import { useProductos } from '@/hooks/useProductos';
import { CompraCompleta, CompraFormData } from '@/interfaces';
import { Plus, Eye, CheckCircle, XCircle, Package, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal/index';

export  function Compras() {
  const {
    compras,
    comprasPendientes,
    isLoading,
    createCompra,
    updateEstadoCompra,
  } = useCompras();

  const { proveedoresActivos } = useProveedores();
  const { productosActivos } = useProductos();

  const [showModal, setShowModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState<CompraCompleta | null>(null);
  const [filterEstado, setFilterEstado] = useState<'TODOS' | 'PENDIENTE' | 'COMPLETADA' | 'ANULADA'>('TODOS');

  // Manejar ver detalle
  const handleVerDetalle = (compra: CompraCompleta) => {
    setSelectedCompra(compra);
    setShowDetalleModal(true);
  };

  // Manejar cambio de estado
  const handleCambiarEstado = async (compra: CompraCompleta, nuevoEstado: string) => {
    const mensajes = {
      COMPLETADA: '¿Confirmar recepción de la compra? Esto actualizará el inventario.',
      ANULADA: '¿Estás seguro de anular esta compra?',
    };

    if (window.confirm(mensajes[nuevoEstado as keyof typeof mensajes])) {
      try {
        await updateEstadoCompra.mutateAsync({
          id: compra.id,
          estado: nuevoEstado,
        });
        toast.success(
          nuevoEstado === 'COMPLETADA' 
            ? 'Compra completada e inventario actualizado' 
            : 'Compra anulada correctamente'
        );
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        toast.error('No se pudo cambiar el estado');
      }
    }
  };

  // Filtrar compras según estado seleccionado
  const comprasFiltradas = React.useMemo(() => {
    if (!compras) return [];
    if (filterEstado === 'TODOS') return compras;
    return compras.filter((c) => c.estado === filterEstado);
  }, [compras, filterEstado]);

  // Definir columnas
  const columns: ColumnDef<CompraCompleta>[] = [
    {
      header: 'Fecha',
      accessor: (row) => row.created_at,
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {new Date(row.created_at).toLocaleDateString('es-PE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(row.created_at).toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      ),
    },
    {
      header: 'Proveedor',
      accessor: (row) => row.proveedor?.nombre || '',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.proveedor?.nombre}
          </div>
          {row.proveedor?.ruc && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              RUC: {row.proveedor.ruc}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Productos',
      accessor: (row) => row.detalle_compras?.length || 0,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">
            {row.detalle_compras?.length || 0} items
          </span>
        </div>
      ),
    },
    {
      header: 'Total',
      accessor: (row) => row.total,
      render: (row) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          S/ {row.total.toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Estado',
      accessor: (row) => row.estado,
      render: (row) => {
        const colores = {
          PENDIENTE: 'warning',
          COMPLETADA: 'success',
          ANULADA: 'error',
        };
        return (
          <Badge color={colores[row.estado as keyof typeof colores]} size="sm">
            {row.estado}
          </Badge>
        );
      },
    },
    {
      header: 'Fecha Entrega',
      accessor: (row) => row.fecha_entrega || '',
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {row.fecha_entrega
            ? new Date(row.fecha_entrega).toLocaleDateString('es-PE')
            : 'No especificada'}
        </span>
      ),
    },
    {
      header: 'Acciones',
      accessor: (row) => row.id,
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleVerDetalle(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-900/20"
            title="Ver detalle"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.estado === 'PENDIENTE' && (
            <>
              <button
                onClick={() => handleCambiarEstado(row, 'COMPLETADA')}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors dark:hover:bg-green-900/20"
                title="Marcar como completada"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleCambiarEstado(row, 'ANULADA')}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20"
                title="Anular compra"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">
          Cargando compras...
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Compras" />

      <div className="space-y-6">
      

        {/* Tabla de compras */}
        <ComponentCard
          title="Lista de compras"
          action={
            <div className="flex items-center gap-3">
              {/* Filtro de estado */}
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value as any)}
                className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="TODOS">Todos</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="COMPLETADA">Completadas</option>
                <option value="ANULADA">Anuladas</option>
              </select>

              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nueva Compra
              </button>
            </div>
          }
        >
          <DynamicTable
            data={comprasFiltradas}
            columns={columns}
            itemsPerPage={10}
            searchPlaceholder="Buscar compras..."
            emptyMessage="No hay compras registradas"
          />
        </ComponentCard>
      </div>

      {/* Modal de nueva compra */}
      {showModal && (
        <CompraModal
          onClose={() => setShowModal(false)}
          onSave={async (data: CompraFormData) => {
            try {
              await createCompra.mutateAsync(data);
              toast.success('Compra registrada correctamente');
              setShowModal(false);
            } catch (error: any) {
              console.error('Error:', error);
              toast.error(error.message || 'Ocurrió un error al guardar');
            }
          }}
          proveedores={proveedoresActivos || []}
          productos={productosActivos || []}
        />
      )}

      {/* Modal de detalle */}
      {showDetalleModal && selectedCompra && (
        <DetalleCompraModal
          compra={selectedCompra}
          onClose={() => {
            setShowDetalleModal(false);
            setSelectedCompra(null);
          }}
        />
      )}
    </div>
  );
}

// Modal de Nueva Compra
interface CompraModalProps {
  onClose: () => void;
  onSave: (data: CompraFormData) => Promise<void>;
  proveedores: any[];
  productos: any[];
}

function CompraModal({ onClose, onSave, proveedores, productos }: CompraModalProps) {
  const [formData, setFormData] = useState<CompraFormData>({
    proveedor_id: '',
    fecha_entrega: '',
    productos: [],
  });

  const [productoSeleccionado, setProductoSeleccionado] = useState('');

  const agregarProducto = () => {
    if (!productoSeleccionado) {
      toast.error('Selecciona un producto');
      return;
    }

    const producto = productos.find(p => p.id === productoSeleccionado);
    if (!producto) return;

    // Verificar si el producto ya está agregado
    if (formData.productos.some(p => p.producto_id === productoSeleccionado)) {
      toast.error('El producto ya está agregado');
      return;
    }

    setFormData({
      ...formData,
      productos: [
        ...formData.productos,
        {
          producto_id: productoSeleccionado,
          cantidad: 1,
          precio_unitario: producto.precio_compra || 0,
          lote: '',
          fecha_vencimiento: '',
        },
      ],
    });

    setProductoSeleccionado('');
  };

  const eliminarProducto = (index: number) => {
    setFormData({
      ...formData,
      productos: formData.productos.filter((_, i) => i !== index),
    });
  };

  const actualizarProducto = (index: number, campo: string, valor: any) => {
    const nuevosProductos = [...formData.productos];
    nuevosProductos[index] = { ...nuevosProductos[index], [campo]: valor };
    setFormData({ ...formData, productos: nuevosProductos });
  };

  const calcularTotal = () => {
    return formData.productos.reduce(
      (sum, p) => sum + p.cantidad * p.precio_unitario,
      0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.proveedor_id) {
      toast.error('Selecciona un proveedor');
      return;
    }
    
    if (formData.productos.length === 0) {
      toast.error('Agrega al menos un producto');
      return;
    }

    // Validar que todos los productos tengan cantidad y precio
    const productosInvalidos = formData.productos.filter(
      p => p.cantidad <= 0 || p.precio_unitario <= 0
    );

    if (productosInvalidos.length > 0) {
      toast.error('Todos los productos deben tener cantidad y precio válidos');
      return;
    }

    await onSave(formData);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      showCloseButton={true}
      isFullscreen={false}
      className="max-w-4xl p-6 max-h-[90vh] overflow-y-auto"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Nueva Compra
      </h2>

      {/* Alerta informativa */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-2">
        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Nota:</strong> Al completar la compra, el stock de cada producto se actualizará automáticamente.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Proveedor *
            </label>
            <select
              value={formData.proveedor_id}
              onChange={(e) =>
                setFormData({ ...formData, proveedor_id: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Seleccionar proveedor</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Fecha de Entrega
            </label>
            <input
              type="date"
              value={formData.fecha_entrega}
              onChange={(e) =>
                setFormData({ ...formData, fecha_entrega: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Productos
            </h3>
            <div className="flex gap-2">
              <select
                value={productoSeleccionado}
                onChange={(e) => setProductoSeleccionado(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="">Seleccionar producto...</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre_comercial} - Stock actual: {p.stock_actual}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={agregarProducto}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                + Agregar
              </button>
            </div>
          </div>

          {formData.productos.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay productos agregados. Selecciona un producto arriba.
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {formData.productos.map((prod, index) => {
                const producto = productos.find(p => p.id === prod.producto_id);
                return (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="col-span-3">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {producto?.nombre_comercial}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Stock actual: {producto?.stock_actual}
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <label className="text-xs text-gray-600 dark:text-gray-400">Cantidad</label>
                      <input
                        type="number"
                        value={prod.cantidad}
                        onChange={(e) =>
                          actualizarProducto(index, 'cantidad', Number(e.target.value))
                        }
                        className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-600 dark:text-white"
                        min="1"
                        required
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="text-xs text-gray-600 dark:text-gray-400">Precio Unit.</label>
                      <input
                        type="number"
                        value={prod.precio_unitario}
                        onChange={(e) =>
                          actualizarProducto(
                            index,
                            'precio_unitario',
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-600 dark:text-white"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-xs text-gray-600 dark:text-gray-400">Lote</label>
                      <input
                        type="text"
                        value={prod.lote || ''}
                        onChange={(e) =>
                          actualizarProducto(index, 'lote', e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-600 dark:text-white"
                        placeholder="Opcional"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-xs text-gray-600 dark:text-gray-400">F. Venc.</label>
                      <input
                        type="date"
                        value={prod.fecha_vencimiento || ''}
                        onChange={(e) =>
                          actualizarProducto(index, 'fecha_vencimiento', e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div className="col-span-1 text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Subtotal</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        S/ {(prod.cantidad * prod.precio_unitario).toFixed(2)}
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarProducto(index)}
                        className="text-red-600 hover:text-red-700 text-xs mt-1"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t pt-4 flex justify-between items-center">
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            Total: S/ {calcularTotal().toFixed(2)}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-black dark:text-white"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={formData.productos.length === 0}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Registrar Compra
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

// Modal de Detalle de Compra
interface DetalleCompraModalProps {
  compra: CompraCompleta;
  onClose: () => void;
}

function DetalleCompraModal({ compra, onClose }: DetalleCompraModalProps) {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      showCloseButton={true}
      isFullscreen={false}
      className="max-w-3xl p-6"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Detalle de Compra
      </h2>

      <div className="space-y-4">
        {/* Información general */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Proveedor
            </div>
            <div className="font-medium text-gray-900 dark:text-white">
              {compra.proveedor?.nombre}
            </div>
            {compra.proveedor?.ruc && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                RUC: {compra.proveedor.ruc}
              </div>
            )}
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Estado</div>
            <Badge
              color={
                compra.estado === 'COMPLETADA'
                  ? 'success'
                  : compra.estado === 'PENDIENTE'
                  ? 'warning'
                  : 'error'
              }
            >
              {compra.estado}
            </Badge>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Fecha de Compra
            </div>
            <div className="font-medium text-gray-900 dark:text-white">
              {new Date(compra.created_at).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Fecha de Entrega
            </div>
            <div className="font-medium text-gray-900 dark:text-white">
              {compra.fecha_entrega
                ? new Date(compra.fecha_entrega).toLocaleDateString('es-PE')
                : 'No especificada'}
            </div>
          </div>
        </div>

        {/* Productos */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
            Productos
          </h3>
          <div className="space-y-2">
            {compra.detalle_compras?.map((detalle, index) => (
              <div
                key={index}
                className="flex justify-between items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {detalle.producto?.nombre_comercial}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-1">
                    <div>Cantidad: {detalle.cantidad} | Precio Unit: S/ {detalle.precio_unitario.toFixed(2)}</div>
                    {detalle.lote && <div>Lote: {detalle.lote}</div>}
                    {detalle.fecha_vencimiento && (
                      <div>
                        Vencimiento: {new Date(detalle.fecha_vencimiento).toLocaleDateString('es-PE')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  S/ {detalle.subtotal.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="border-t pt-4 flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Total:
          </span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            S/ {compra.total.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-black dark:text-white"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}