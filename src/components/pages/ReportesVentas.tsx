'use client';

import React, { useState, useMemo } from 'react';
import { useVentas } from '@/hooks/useVentas';
import PageBreadcrumb from '../common/PageBreadCrumb';
import ComponentCard from '../common/ComponentCard';
import DynamicTable, { ColumnDef } from '../tables/DynamicTable';
import Badge from '../ui/badge/Badge';
import { VentaCompleta } from '@/interfaces';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar,
  Download,
  BarChart3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export  function ReportesVentas() {
  // Estado para filtros de fecha
  const [fechaInicio, setFechaInicio] = useState(() => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - 30); // Últimos 30 días por defecto
    return fecha.toISOString().split('T')[0];
  });

  const [fechaFin, setFechaFin] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Obtener ventas del rango de fechas
  const { data: ventas, isLoading } = useVentas().getVentasByDateRange(
    `${fechaInicio}T00:00:00`,
    `${fechaFin}T23:59:59`
  );

  // Filtrar solo ventas completadas
  const ventasCompletadas = useMemo(
    () => ventas?.filter((v) => v.estado === 'COMPLETADA') || [],
    [ventas]
  );

  // Calcular estadísticas generales
  const estadisticas = useMemo(() => {
    const totalVentas = ventasCompletadas.length;
    const totalIngresos = ventasCompletadas.reduce((sum, v) => sum + v.total, 0);
    const promedioVenta = totalVentas > 0 ? totalIngresos / totalVentas : 0;
    const totalProductosVendidos = ventasCompletadas.reduce(
      (sum, v) => sum + v.detalle_ventas.reduce((s, d) => s + d.cantidad, 0),
      0
    );

    return {
      totalVentas,
      totalIngresos,
      promedioVenta,
      totalProductosVendidos,
    };
  }, [ventasCompletadas]);

  // Datos para gráfico de ventas por día
  const ventasPorDia = useMemo(() => {
    const agrupado: { [key: string]: number } = {};

    ventasCompletadas.forEach((venta) => {
      const fecha = new Date(venta.created_at).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
      });
      agrupado[fecha] = (agrupado[fecha] || 0) + venta.total;
    });

    return Object.entries(agrupado)
      .map(([fecha, total]) => ({
        fecha,
        total: Number(total.toFixed(2)),
      }))
      .slice(-15); // Últimos 15 días
  }, [ventasCompletadas]);

  // Datos para gráfico de ventas por método de pago
  const ventasPorMetodoPago = useMemo(() => {
    const agrupado: { [key: string]: number } = {};

    ventasCompletadas.forEach((venta) => {
      const metodo = venta.metodo_pago || 'No especificado';
      agrupado[metodo] = (agrupado[metodo] || 0) + venta.total;
    });

    return Object.entries(agrupado).map(([metodo, total]) => ({
      metodo,
      total: Number(total.toFixed(2)),
    }));
  }, [ventasCompletadas]);

  // Productos más vendidos
  const productosMasVendidos = useMemo(() => {
    const agrupado: {
      [key: string]: {
        nombre: string;
        cantidad: number;
        total: number;
      };
    } = {};

    ventasCompletadas.forEach((venta) => {
      venta.detalle_ventas.forEach((detalle) => {
        const key = detalle.producto_id;
        if (!agrupado[key]) {
          agrupado[key] = {
            nombre: detalle.producto.nombre_comercial,
            cantidad: 0,
            total: 0,
          };
        }
        agrupado[key].cantidad += detalle.cantidad;
        agrupado[key].total += detalle.subtotal;
      });
    });

    return Object.values(agrupado)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);
  }, [ventasCompletadas]);

  // Ventas por hora del día
  const ventasPorHora = useMemo(() => {
    const agrupado: { [key: number]: number } = {};

    ventasCompletadas.forEach((venta) => {
      const hora = new Date(venta.created_at).getHours();
      agrupado[hora] = (agrupado[hora] || 0) + 1;
    });

    return Array.from({ length: 24 }, (_, i) => ({
      hora: `${i}:00`,
      ventas: agrupado[i] || 0,
    }));
  }, [ventasCompletadas]);

  // Colores para gráficos
  const COLORES = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Columnas para tabla de ventas
  const columns: ColumnDef<VentaCompleta>[] = [
    {
      header: 'N° Venta',
      accessor: (row) => row.numero_venta,
      render: (row) => (
        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
          {row.numero_venta}
        </span>
      ),
    },
    {
      header: 'Fecha',
      accessor: (row) => row.created_at,
      render: (row) => (
        <div>
          <p className="text-sm text-gray-900 dark:text-white">
            {new Date(row.created_at).toLocaleDateString('es-PE')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(row.created_at).toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      ),
    },
    {
      header: 'Cliente',
      accessor: (row) => row.cliente?.nombre || 'Público General',
      render: (row) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {row.cliente
            ? `${row.cliente.nombre} ${row.cliente.apellido || ''}`
            : 'Público General'}
        </span>
      ),
    },
    {
      header: 'Productos',
      accessor: (row) => row.detalle_ventas.length,
      render: (row) => {
        const totalItems = row.detalle_ventas.reduce((sum, d) => sum + d.cantidad, 0);
        return (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
        );
      },
    },
    {
      header: 'Método Pago',
      accessor: (row) => row.metodo_pago || '',
      render: (row) => (
        <Badge color="info" size="sm">
          {row.metodo_pago || 'No especificado'}
        </Badge>
      ),
    },
    {
      header: 'Total',
      accessor: (row) => row.total,
      render: (row) => (
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          S/ {row.total.toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Estado',
      accessor: (row) => row.estado,
      render: (row) => (
        <Badge color={row.estado === 'COMPLETADA' ? 'success' : 'error'} size="sm">
          {row.estado}
        </Badge>
      ),
    },
  ];

  // Función para exportar a CSV
  const exportarCSV = () => {
    const headers = ['N° Venta', 'Fecha', 'Cliente', 'Total', 'Método Pago', 'Estado'];
    const csvData = ventasCompletadas.map((v) => [
      v.numero_venta,
      new Date(v.created_at).toLocaleString('es-PE'),
      v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido || ''}` : 'Público General',
      v.total.toFixed(2),
      v.metodo_pago || 'No especificado',
      v.estado,
    ]);

    const csv = [headers, ...csvData].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-ventas-${fechaInicio}-${fechaFin}.csv`;
    a.click();
  };

  // Aplicar filtros rápidos
  const aplicarFiltroRapido = (dias: number) => {
    const fin = new Date();
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - dias);

    setFechaInicio(inicio.toISOString().split('T')[0]);
    setFechaFin(fin.toISOString().split('T')[0]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Cargando reportes...</div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Reportes de Ventas" />

      <div className="space-y-6">
        {/* Filtros de fecha */}
        <ComponentCard title="Filtros" icon={<Calendar className="w-5 h-5" />}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Filtros Rápidos
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => aplicarFiltroRapido(7)}
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                  >
                    7 días
                  </button>
                  <button
                    onClick={() => aplicarFiltroRapido(30)}
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                  >
                    30 días
                  </button>
                  <button
                    onClick={() => aplicarFiltroRapido(90)}
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                  >
                    90 días
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Ventas</p>
                <p className="text-3xl font-bold mt-1">
                  {estadisticas.totalVentas}
                </p>
              </div>
              <ShoppingCart className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Ingresos Totales</p>
                <p className="text-3xl font-bold mt-1">
                  S/ {estadisticas.totalIngresos.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Promedio por Venta</p>
                <p className="text-3xl font-bold mt-1">
                  S/ {estadisticas.promedioVenta.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Productos Vendidos</p>
                <p className="text-3xl font-bold mt-1">
                  {estadisticas.totalProductosVendidos}
                </p>
              </div>
              <BarChart3 className="w-12 h-12 opacity-80" />
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de ventas por día */}
          <ComponentCard title="Ventas por Día">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ventasPorDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `S/ ${value.toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #ccc',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Total Ventas"
                />
              </LineChart>
            </ResponsiveContainer>
          </ComponentCard>

          {/* Gráfico de ventas por método de pago */}
          <ComponentCard title="Ventas por Método de Pago">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ventasPorMetodoPago}
                  dataKey="total"
                  nameKey="metodo"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.metodo}: S/ ${entry.total.toFixed(2)}`}
                >
                  {ventasPorMetodoPago.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `S/ ${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </ComponentCard>

          {/* Gráfico de productos más vendidos */}
          <ComponentCard title="Top 10 Productos Más Vendidos">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productosMasVendidos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) =>
                    name === 'cantidad'
                      ? `${value} unidades`
                      : `S/ ${value.toFixed(2)}`
                  }
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #ccc',
                  }}
                />
                <Legend />
                <Bar dataKey="cantidad" fill="#10b981" name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          </ComponentCard>

          {/* Gráfico de ventas por hora */}
          <ComponentCard title="Ventas por Hora del Día">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ventasPorHora}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #ccc',
                  }}
                />
                <Legend />
                <Bar dataKey="ventas" fill="#8b5cf6" name="Número de Ventas" />
              </BarChart>
            </ResponsiveContainer>
          </ComponentCard>
        </div>

        {/* Tabla de ventas detalladas */}
        <ComponentCard
          title="Detalle de Ventas"
          action={
            <button
              onClick={exportarCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          }
        >
          {ventasCompletadas.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                No hay ventas en el período seleccionado
              </p>
            </div>
          ) : (
            <DynamicTable
              data={ventasCompletadas}
              columns={columns}
              itemsPerPage={15}
              searchPlaceholder="Buscar por N° venta, cliente..."
              emptyMessage="No se encontraron ventas"
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
}