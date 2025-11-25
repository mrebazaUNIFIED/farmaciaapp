// pages/Ventas.tsx
'use client';

import React, { useState } from 'react';
import PageBreadcrumb from '../common/PageBreadCrumb';
import ComponentCard from '../common/ComponentCard';
import DynamicTable, { ColumnDef } from '../tables/DynamicTable';
import Badge from '../ui/badge/Badge';
import { useVentas } from '@/hooks/useVentas';
import { VentaCompleta } from '@/interfaces';
import { Plus, Eye, XCircle, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal/index';

export default function Ventas() {
  const {
    ventas,
    isLoading,
    anularVenta,
  } = useVentas();

  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaCompleta | null>(null);

  // Manejar ver detalle
  const handleVerDetalle = (venta: VentaCompleta) => {
    setVentaSeleccionada(venta);
    setShowDetalleModal(true);
  };

  // Manejar anulación
  const handleAnular = async (venta: VentaCompleta) => {
    if (venta.estado === 'ANULADA') {
      toast.warning('Esta venta ya está anulada');
      return;
    }

    if (window.confirm(`¿Estás seguro de anular la venta #${venta.id.slice(0, 8)}?`)) {
      try {
        await anularVenta.mutateAsync(venta.id);
        toast.success('Venta anulada correctamente');
      } catch (error) {
        console.error('Error al anular:', error);
        toast.error('No se pudo anular la venta');
      }
    }
  };

  // Definir columnas
  const columns: ColumnDef<VentaCompleta>[] = [
    {
      header: 'Fecha',
      accessor: (row) => row.created_at,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">
            {new Date(row.created_at).toLocaleDateString('es-PE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(row.created_at).toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      ),
    },
    {
      header: 'Cliente',
      accessor: (row) => row.cliente?.nombre || 'Sin cliente',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">
            {row.cliente ? `${row.cliente.nombre} ${row.cliente.apellido || ''}` : 'Cliente General'}
          </span>
          {row.cliente?.dni && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              DNI: {row.cliente.dni}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Productos',
      accessor: (row) => row.detalle_ventas.length,
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.detalle_ventas.length} {row.detalle_ventas.length === 1 ? 'producto' : 'productos'}
        </span>
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
      header: 'Método Pago',
      accessor: (row) => row.metodo_pago,
      render: (row) => (
        <Badge 
          color={
            row.metodo_pago === 'Efectivo' ? 'success' : 
            row.metodo_pago === 'Yape' ? 'primary' : 
            'info'
          } 
          size="sm"
        >
          {row.metodo_pago}
        </Badge>
      ),
    },
    {
      header: 'Estado',
      accessor: (row) => row.estado,
      render: (row) => (
        <Badge 
          color={row.estado === 'COMPLETADA' ? 'success' : 'error'} 
          size="sm"
        >
          {row.estado}
        </Badge>
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
          {row.estado === 'COMPLETADA' && (
            <button
              onClick={() => handleAnular(row)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20"
              title="Anular venta"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  // Mostrar estados de carga y error
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">
          Cargando ventas...
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Ventas" />
      
      <div className="space-y-6">
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Ventas Hoy</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {ventas?.filter(v => {
                    const today = new Date().toDateString();
                    const ventaDate = new Date(v.created_at).toDateString();
                    return today === ventaDate && v.estado === 'COMPLETADA';
                  }).length || 0}
                </p>
              </div>
              <Receipt className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos Hoy</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  S/ {ventas?.filter(v => {
                    const today = new Date().toDateString();
                    const ventaDate = new Date(v.created_at).toDateString();
                    return today === ventaDate && v.estado === 'COMPLETADA';
                  }).reduce((sum, v) => sum + v.total, 0).toFixed(2) || '0.00'}
                </p>
              </div>
              <Receipt className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ventas Totales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {ventas?.filter(v => v.estado === 'COMPLETADA').length || 0}
                </p>
              </div>
              <Receipt className="w-10 h-10 text-purple-600" />
            </div>
          </div>
        </div>

        <ComponentCard
          title="Lista de ventas"
        
        >
          <DynamicTable
            data={ventas || []}
            columns={columns}
            itemsPerPage={10}
            searchPlaceholder="Buscar ventas..."
            emptyMessage="No hay ventas registradas"
          />
        </ComponentCard>
      </div>

      {/* Modal de detalle de venta */}
      {showDetalleModal && ventaSeleccionada && (
        <DetalleVentaModal
          venta={ventaSeleccionada}
          onClose={() => {
            setShowDetalleModal(false);
            setVentaSeleccionada(null);
          }}
        />
      )}
    </div>
  );
}

interface DetalleVentaModalProps {
  venta: VentaCompleta;
  onClose: () => void;
}

function DetalleVentaModal({ venta, onClose }: DetalleVentaModalProps) {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      showCloseButton={true}
      isFullscreen={false}
      className="max-w-3xl p-6"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Detalle de Venta
          </h2>
          <Badge color={venta.estado === 'COMPLETADA' ? 'success' : 'error'}>
            {venta.estado}
          </Badge>
        </div>

        {/* Información general */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Fecha</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {new Date(venta.created_at).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cliente</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {venta.cliente 
                ? `${venta.cliente.nombre} ${venta.cliente.apellido || ''}`
                : 'Cliente General'
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Método de Pago</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {venta.metodo_pago}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              S/ {venta.total.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Tabla de productos */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
            Productos
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Producto
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cantidad
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                    Precio Unit.
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {venta.detalle_ventas.map((detalle, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {detalle.producto.nombre_comercial}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">
                      {detalle.cantidad}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      S/ {detalle.precio_unitario.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">
                      S/ {detalle.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                    Total:
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-lg text-gray-900 dark:text-white">
                    S/ {venta.total.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-black dark:text-white hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}