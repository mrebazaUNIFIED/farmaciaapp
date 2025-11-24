'use client';

import React, { useState } from 'react';
import PageBreadcrumb from '../common/PageBreadCrumb';
import ComponentCard from '../common/ComponentCard';
import DynamicTable, { ColumnDef } from '../tables/DynamicTable';
import Badge from '../ui/badge/Badge';
import { useProductos } from '@/hooks/useProductos';
import { useCategorias } from '@/hooks/useCategorias';
import { useProveedores } from '@/hooks/useProveedores';
import { Categoria, ProductoConRelaciones, ProductoFormData, Proveedor } from '@/interfaces'; 
import { Plus, Edit, Trash2, Pill, Package, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from "@/components/ui/modal/index";
import { UNIDADES_MEDIDA, TEMPERATURAS } from '@/interfaces'; 
import { formatCurrency } from '@/lib/utils';  

export const Productos = () => {
  const {
    productos,
    isLoading,
    createProducto,
    updateProducto,
    deleteProducto,
  } = useProductos();

  const { categoriasActivas } = useCategorias();
  const { proveedoresActivos } = useProveedores();

  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState<ProductoConRelaciones | null>(null);

  // Manejar edición
  const handleEdit = (producto: ProductoConRelaciones) => {
    setEditingProducto(producto);
    setShowModal(true);
  };

  // Manejar eliminación
  const handleDelete = async (producto: ProductoConRelaciones) => {
    if (window.confirm(`¿Estás seguro de eliminar el producto "${producto.nombre_comercial}"?`)) {
      try {
        await deleteProducto.mutateAsync(producto.id);
        toast.success('Producto eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar:', error);
        toast.error('No se pudo eliminar el producto');
      }
    }
  };

  // Definir columnas
  const columns: ColumnDef<ProductoConRelaciones>[] = [
    {
      header: 'Producto',
      accessor: (row) => row.nombre_comercial,
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Pill className="w-4 h-4 text-blue-500" />
            {row.nombre_comercial}
          </div>
          {row.principio_activo && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Principio activo: {row.principio_activo}
            </div>
          )}
          {row.presentacion && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Presentación: {row.presentacion}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Categoría / Proveedor',
      accessor: (row) => `${row.categoria?.nombre || ''} ${row.proveedor?.nombre || ''}`,
      render: (row) => (
        <div className="space-y-1">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Cat: {row.categoria?.nombre || 'N/A'}
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Prov: {row.proveedor?.nombre || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      header: 'Precios',
      accessor: (row) => row.precio_venta,
      render: (row) => (
        <div className="space-y-1 text-right">
          <div className="font-medium text-gray-900 dark:text-white">
            Venta: {formatCurrency(row.precio_venta)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Compra: {formatCurrency(row.precio_compra)}
          </div>
        </div>
      ),
    },
    {
      header: 'Stock',
      accessor: (row) => row.stock_actual,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{row.stock_actual}</span>
          <span className="text-xs text-gray-500">/{row.unidad_medida}</span>
          {row.stock_actual < row.stock_minimo && (
            <AlertCircle className="w-4 h-4 text-yellow-500" title="Stock bajo" />
          )}
        </div>
      ),
    },
    {
      header: 'Estado',
      accessor: (row) => row.activo,
      render: (row) => (
        <Badge color={row.activo ? 'success' : 'error'} size="sm">
          {row.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      accessor: (row) => row.id,
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-900/20"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">
          Cargando productos...
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Productos" />
      
      <div className="space-y-6">
        <ComponentCard
          title="Lista de productos"
          desc="Gestiona los productos de tu farmacia"
          action={
            <button
              onClick={() => {
                setEditingProducto(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Producto
            </button>
          }
        >
          <DynamicTable
            data={productos || []}
            columns={columns}
            itemsPerPage={10}
            searchPlaceholder="Buscar productos por nombre, principio activo o código de barras..."
            emptyMessage="No hay productos registrados"
          />
        </ComponentCard>
      </div>

      {/* Modal de crear/editar */}
      {showModal && (
        <ProductoModal
          producto={editingProducto}
          categorias={categoriasActivas || []}
          proveedores={proveedoresActivos || []}
          onClose={() => {
            setShowModal(false);
            setEditingProducto(null);
          }}
          onSave={async (data) => {
            try {
              if (editingProducto) {
                await updateProducto.mutateAsync({
                  id: editingProducto.id,
                  ...data,
                });
                toast.success('Producto actualizado correctamente');
              } else {
                await createProducto.mutateAsync(data);
                toast.success('Producto creado correctamente');
              }
              setShowModal(false);
              setEditingProducto(null);
            } catch (error) {
              console.error('Error:', error);
              toast.error('Ocurrió un error al guardar');
            }
          }}
        />
      )}
    </div>
  );
}

// ============================================
// Modal de Producto
// ============================================

interface ProductoModalProps {
  producto: ProductoConRelaciones | null;
  categorias: Categoria[];
  proveedores: Proveedor[];
  onClose: () => void;
  onSave: (data: ProductoFormData) => Promise<void>;
}

function ProductoModal({ producto, categorias, proveedores, onClose, onSave }: ProductoModalProps) {
  const [formData, setFormData] = useState<ProductoFormData>({
    codigo_barras: producto?.codigo_barras || '',
    nombre_comercial: producto?.nombre_comercial || '',
    principio_activo: producto?.principio_activo || '',
    categoria_id: producto?.categoria_id || '',
    proveedor_id: producto?.proveedor_id || '',
    presentacion: producto?.presentacion || '',
    concentracion: producto?.concentracion || '',
    precio_compra: producto?.precio_compra || 0,
    precio_venta: producto?.precio_venta || 0,
    stock_actual: producto?.stock_actual || 0,
    stock_minimo: producto?.stock_minimo || 0,
    stock_maximo: producto?.stock_maximo || 0,
    unidad_medida: producto?.unidad_medida || 'Unidad',
    lote: producto?.lote || '',
    fecha_fabricacion: producto?.fecha_fabricacion || '',
    fecha_vencimiento: producto?.fecha_vencimiento || '',
    requiere_receta: producto?.requiere_receta || false,
    medicamento_controlado: producto?.medicamento_controlado || false,
    ubicacion: producto?.ubicacion || '',
    temperatura_almacenamiento: producto?.temperatura_almacenamiento || '',
    registro_sanitario: producto?.registro_sanitario || '',
    descripcion: producto?.descripcion || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      showCloseButton={true}
      isFullscreen={false}
      className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl p-4 sm:p-6"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        {producto ? 'Editar Producto' : 'Nuevo Producto'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Nombre Comercial *
            </label>
            <input
              type="text"
              value={formData.nombre_comercial}
              onChange={(e) => setFormData({ ...formData, nombre_comercial: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Ej: Paracetamol"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Principio Activo
            </label>
            <input
              type="text"
              value={formData.principio_activo}
              onChange={(e) => setFormData({ ...formData, principio_activo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Ej: Acetaminofén"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Categoría
            </label>
            <select
              value={formData.categoria_id}
              onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Proveedor
            </label>
            <select
              value={formData.proveedor_id}
              onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Selecciona un proveedor</option>
              {proveedores.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Código de Barras
            </label>
            <input
              type="text"
              value={formData.codigo_barras}
              onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Ej: 7751234567890"
            />
          </div>
        </div>

        {/* Presentación y detalles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Presentación
            </label>
            <input
              type="text"
              value={formData.presentacion}
              onChange={(e) => setFormData({ ...formData, presentacion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Ej: Tabletas"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Concentración
            </label>
            <input
              type="text"
              value={formData.concentracion}
              onChange={(e) => setFormData({ ...formData, concentracion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Ej: 500mg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Unidad de Medida
            </label>
            <select
              value={formData.unidad_medida}
              onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {UNIDADES_MEDIDA.map((unidad) => (
                <option key={unidad} value={unidad}>
                  {unidad}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Precios y stock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Precio Compra *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.precio_compra}
              onChange={(e) => setFormData({ ...formData, precio_compra: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Precio Venta *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.precio_venta}
              onChange={(e) => setFormData({ ...formData, precio_venta: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Stock Actual *
            </label>
            <input
              type="number"
              value={formData.stock_actual}
              onChange={(e) => setFormData({ ...formData, stock_actual: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Stock Mínimo
            </label>
            <input
              type="number"
              value={formData.stock_minimo}
              onChange={(e) => setFormData({ ...formData, stock_minimo: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Stock Máximo
            </label>
            <input
              type="number"
              value={formData.stock_maximo}
              onChange={(e) => setFormData({ ...formData, stock_maximo: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Lote
            </label>
            <input
              type="text"
              value={formData.lote}
              onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Ej: LOT12345"
            />
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Fecha Fabricación
            </label>
            <input
              type="date"
              value={formData.fecha_fabricacion || ''}
              onChange={(e) => setFormData({ ...formData, fecha_fabricacion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Fecha Vencimiento
            </label>
            <input
              type="date"
              value={formData.fecha_vencimiento || ''}
              onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* Controles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="requiere_receta"
              checked={formData.requiere_receta}
              onChange={(e) => setFormData({ ...formData, requiere_receta: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="requiere_receta" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Requiere Receta
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="medicamento_controlado"
              checked={formData.medicamento_controlado}
              onChange={(e) => setFormData({ ...formData, medicamento_controlado: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="medicamento_controlado" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Medicamento Controlado
            </label>
          </div>
        </div>

        {/* Almacenamiento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Ubicación
            </label>
            <input
              type="text"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Ej: Estante A-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Temperatura Almacenamiento
            </label>
            <select
              value={formData.temperatura_almacenamiento || ''}
              onChange={(e) => setFormData({ ...formData, temperatura_almacenamiento: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Selecciona temperatura</option>
              {TEMPERATURAS.map((temp) => (
                <option key={temp} value={temp}>
                  {temp}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Registro Sanitario
            </label>
            <input
              type="text"
              value={formData.registro_sanitario}
              onChange={(e) => setFormData({ ...formData, registro_sanitario: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Ej: REG-12345"
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Descripción
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows={3}
            placeholder="Descripción detallada del producto"
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}