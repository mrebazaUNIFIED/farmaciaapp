// pages/HistorialCambios.tsx
'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import PageBreadcrumb from '../common/PageBreadCrumb';
import ComponentCard from '../common/ComponentCard';
import DynamicTable, { ColumnDef } from '../tables/DynamicTable';
import Badge from '../ui/badge/Badge';
import { HistorialConProducto, TipoMovimiento } from '@/interfaces';
import {
  Package,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  Calendar,
  User,
  Filter,
} from 'lucide-react';

export  function HistorialCambios() {
  const [tipoFiltro, setTipoFiltro] = useState<TipoMovimiento | 'TODOS'>('TODOS');
  const [diasFiltro, setDiasFiltro] = useState<number>(30);

  // Query para obtener el historial
  const { data: historial, isLoading } = useQuery({
    queryKey: ['historial-inventario', tipoFiltro, diasFiltro],
    queryFn: async () => {
      let query = supabase
        .from('historial_inventario')
        .select(`
          *,
          producto:productos(
            id,
            codigo_barras,
            nombre_comercial,
            principio_activo,
            unidad_medida,
            categoria:categorias(nombre)
          )
        `)
        .order('created_at', { ascending: false });

      // Filtrar por tipo de movimiento
      if (tipoFiltro !== 'TODOS') {
        query = query.eq('tipo_movimiento', tipoFiltro);
      }

      // Filtrar por días
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - diasFiltro);
      query = query.gte('created_at', fechaInicio.toISOString());

      const { data, error } = await query.limit(500);

      if (error) throw error;
      return data as HistorialConProducto[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true,
  });

  // Función para obtener color según tipo de movimiento
  const getColorTipoMovimiento = (tipo: TipoMovimiento) => {
    const colores: Record<TipoMovimiento, 'success' | 'error' | 'warning' | 'info'> = {
      COMPRA: 'success',
      VENTA: 'info',
      AJUSTE_MANUAL: 'warning',
      DEVOLUCION: 'success',
      VENCIDO: 'error',
      DAÑADO: 'error',
      ROBO: 'error',
      MERMA: 'warning',
      DONACION: 'info',
    };
    return colores[tipo] || 'info';
  };

  // Función para obtener icono según tipo de movimiento
  const getIconoTipoMovimiento = (tipo: TipoMovimiento) => {
    switch (tipo) {
      case 'COMPRA':
      case 'DEVOLUCION':
        return <TrendingUp className="w-4 h-4" />;
      case 'VENTA':
        return <TrendingDown className="w-4 h-4" />;
      case 'AJUSTE_MANUAL':
        return <RefreshCw className="w-4 h-4" />;
      case 'VENCIDO':
      case 'DAÑADO':
      case 'ROBO':
      case 'MERMA':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  // Definir columnas
  const columns: ColumnDef<HistorialConProducto>[] = [
    {
      header: 'Fecha',
      accessor: (row) => row.created_at,
      render: (row) => (
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {new Date(row.created_at).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(row.created_at).toLocaleTimeString('es-PE', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Producto',
      accessor: (row) => row.producto.nombre_comercial,
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {row.producto.nombre_comercial}
          </p>
          {row.producto.principio_activo && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {row.producto.principio_activo}
            </p>
          )}
          {row.producto.codigo_barras && (
            <p className="text-xs font-mono text-gray-400 dark:text-gray-500">
              {row.producto.codigo_barras}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Tipo Movimiento',
      accessor: (row) => row.tipo_movimiento,
      render: (row) => (
        <div className="flex items-center gap-2">
          {getIconoTipoMovimiento(row.tipo_movimiento)}
          <Badge color={getColorTipoMovimiento(row.tipo_movimiento)} size="sm">
            {row.tipo_movimiento.replace('_', ' ')}
          </Badge>
        </div>
      ),
    },
    {
      header: 'Stock Anterior',
      accessor: (row) => row.stock_anterior,
      render: (row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {row.stock_anterior} {row.producto.unidad_medida}
        </span>
      ),
    },
    {
      header: 'Cambio',
      accessor: (row) => row.cantidad,
      render: (row) => {
        const esPositivo = row.cantidad > 0;
        return (
          <span
            className={`text-sm font-semibold ${
              esPositivo
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {esPositivo ? '+' : ''}
            {row.cantidad} {row.producto.unidad_medida}
          </span>
        );
      },
    },
    {
      header: 'Stock Nuevo',
      accessor: (row) => row.stock_nuevo,
      render: (row) => (
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {row.stock_nuevo} {row.producto.unidad_medida}
        </span>
      ),
    },
    {
      header: 'Motivo',
      accessor: (row) => row.motivo || '',
      render: (row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
          {row.motivo || '-'}
        </span>
      ),
    },
    {
      header: 'Usuario',
      accessor: (row) => row.usuario_id || '',
      render: (row) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {row.usuario_id ? row.usuario_id.substring(0, 8) : 'Sistema'}
          </span>
        </div>
      ),
    },
  ];

  // Calcular estadísticas
  const estadisticas = {
    totalMovimientos: historial?.length || 0,
    aumentos: historial?.filter((h) => h.cantidad > 0).length || 0,
    disminuciones: historial?.filter((h) => h.cantidad < 0).length || 0,
    ajustes: historial?.filter((h) => h.tipo_movimiento === 'AJUSTE_MANUAL').length || 0,
  };

  // Opciones de filtro
  const tiposMovimiento: (TipoMovimiento | 'TODOS')[] = [
    'TODOS',
    'VENTA',
    'COMPRA',
    'AJUSTE_MANUAL',
    'DEVOLUCION',
    'VENCIDO',
    'DAÑADO',
    'ROBO',
    'MERMA',
    'DONACION',
  ];

  const opcionesDias = [
    { label: 'Últimos 7 días', value: 7 },
    { label: 'Últimos 30 días', value: 30 },
    { label: 'Últimos 90 días', value: 90 },
    { label: 'Último año', value: 365 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Cargando historial...</div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Historial de Cambios de Inventario" />

      <div className="space-y-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Movimientos
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {estadisticas.totalMovimientos}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Aumentos</p>
                <p className="text-2xl font-bold text-green-600">
                  {estadisticas.aumentos}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Disminuciones</p>
                <p className="text-2xl font-bold text-red-600">
                  {estadisticas.disminuciones}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ajustes Manuales
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {estadisticas.ajustes}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <ComponentCard
          title="Filtros"
          icon={<Filter className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Tipo de Movimiento
              </label>
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value as TipoMovimiento | 'TODOS')}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                {tiposMovimiento.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo === 'TODOS' ? 'Todos los movimientos' : tipo.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Período
              </label>
              <select
                value={diasFiltro}
                onChange={(e) => setDiasFiltro(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                {opcionesDias.map((opcion) => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </ComponentCard>

        {/* Tabla de historial */}
        <ComponentCard title="Registro de Movimientos">
          {!historial || historial.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                No hay movimientos en el período seleccionado
              </p>
            </div>
          ) : (
            <DynamicTable
              data={historial}
              columns={columns}
              itemsPerPage={20}
              searchPlaceholder="Buscar por producto, motivo..."
              emptyMessage="No se encontraron movimientos"
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
}