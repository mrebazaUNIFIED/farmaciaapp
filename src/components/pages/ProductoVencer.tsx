// pages/ProductosVencer.tsx
'use client';

import React from 'react';
import PageBreadcrumb from '../common/PageBreadCrumb';
import ComponentCard from '../common/ComponentCard';
import DynamicTable, { ColumnDef } from '../tables/DynamicTable';
import Badge from '../ui/badge/Badge';
import { useProductos } from '@/hooks/useProductos';
import { ProductoConRelaciones } from '@/interfaces';
import { AlertTriangle, Calendar, Package } from 'lucide-react';

export  function ProductosVencer() {
  const { productosPorVencer, isLoading } = useProductos();

  // Función para calcular días restantes
  const calcularDiasRestantes = (fechaVencimiento: string) => {
    const dias = Math.floor(
      (new Date(fechaVencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return dias;
  };

  // Función para determinar color según días restantes
  const getColorPorDias = (dias: number) => {
    if (dias <= 30) return 'error';
    if (dias <= 60) return 'warning';
    return 'info';
  };

  // Definir columnas
  const columns: ColumnDef<ProductoConRelaciones>[] = [
    {
      header: 'Código',
      accessor: (row) => row.codigo_barras || '',
      render: (row) => (
        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
          {row.codigo_barras || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Producto',
      accessor: (row) => row.nombre_comercial,
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {row.nombre_comercial}
          </p>
          {row.principio_activo && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {row.principio_activo}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Categoría',
      accessor: (row) => row.categoria?.nombre || '',
      render: (row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {row.categoria?.nombre || 'Sin categoría'}
        </span>
      ),
    },
    {
      header: 'Proveedor',
      accessor: (row) => row.proveedor?.nombre || '',
      render: (row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {row.proveedor?.nombre || 'Sin proveedor'}
        </span>
      ),
    },
    {
      header: 'Lote',
      accessor: (row) => row.lote || '',
      render: (row) => (
        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
          {row.lote || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Stock',
      accessor: (row) => row.stock_actual,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">
            {row.stock_actual} {row.unidad_medida}
          </span>
        </div>
      ),
    },
    {
      header: 'Fecha Vencimiento',
      accessor: (row) => row.fecha_vencimiento || '',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {row.fecha_vencimiento
              ? new Date(row.fecha_vencimiento).toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              : 'N/A'}
          </span>
        </div>
      ),
    },
    {
      header: 'Días Restantes',
      accessor: (row) => row.fecha_vencimiento || '',
      render: (row) => {
        if (!row.fecha_vencimiento) return null;
        
        const dias = calcularDiasRestantes(row.fecha_vencimiento);
        const color = getColorPorDias(dias);
        
        return (
          <Badge color={color} size="sm">
            {dias} días
          </Badge>
        );
      },
    },
    {
      header: 'Precio Venta',
      accessor: (row) => row.precio_venta,
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          S/ {row.precio_venta.toFixed(2)}
        </span>
      ),
    },
    
  ];

  // Calcular estadísticas
  const estadisticas = {
    total: productosPorVencer.length,
    criticos: productosPorVencer.filter(
      (p) => p.fecha_vencimiento && calcularDiasRestantes(p.fecha_vencimiento) <= 30
    ).length,
    alertas: productosPorVencer.filter(
      (p) =>
        p.fecha_vencimiento &&
        calcularDiasRestantes(p.fecha_vencimiento) > 30 &&
        calcularDiasRestantes(p.fecha_vencimiento) <= 60
    ).length,
    valorTotal: productosPorVencer.reduce(
      (sum, p) => sum + p.precio_venta * p.stock_actual,
      0
    ),
  };

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
      <PageBreadcrumb pageTitle="Productos por Vencer" />

      <div className="space-y-6">
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Productos
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {estadisticas.total}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Críticos (≤30 días)
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {estadisticas.criticos}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Advertencia (31-60 días)
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {estadisticas.alertas}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          
        </div>

        {/* Alerta informativa */}
        {estadisticas.criticos > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-200">
                  ¡Atención! Productos con vencimiento crítico
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Hay {estadisticas.criticos} productos que vencen en 30 días o
                  menos. Se recomienda priorizar su venta o contactar con los
                  proveedores.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de productos */}
        <ComponentCard title="Productos próximos a vencer (90 días)">
          {productosPorVencer.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                No hay productos próximos a vencer
              </p>
            </div>
          ) : (
            <DynamicTable
              data={productosPorVencer}
              columns={columns}
              itemsPerPage={15}
              searchPlaceholder="Buscar productos..."
              emptyMessage="No se encontraron productos"
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
}