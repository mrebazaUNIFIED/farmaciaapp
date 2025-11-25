// hooks/useHistorialInventario.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { HistorialConProducto, TipoMovimiento } from '@/interfaces';

interface UseHistorialOptions {
  productoId?: string;
  tipoMovimiento?: TipoMovimiento;
  dias?: number;
  limit?: number;
}

export function useHistorialInventario(options: UseHistorialOptions = {}) {
  const {
    productoId,
    tipoMovimiento,
    dias = 30,
    limit = 500,
  } = options;

  // Query principal del historial
  const { data: historial, isLoading, error } = useQuery({
    queryKey: ['historial-inventario', productoId, tipoMovimiento, dias],
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
            presentacion,
            categoria:categorias(id, nombre),
            proveedor:proveedores(id, nombre)
          )
        `)
        .order('created_at', { ascending: false });

      // Filtrar por producto específico
      if (productoId) {
        query = query.eq('producto_id', productoId);
      }

      // Filtrar por tipo de movimiento
      if (tipoMovimiento) {
        query = query.eq('tipo_movimiento', tipoMovimiento);
      }

      // Filtrar por días
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - dias);
      query = query.gte('created_at', fechaInicio.toISOString());

      // Limitar resultados
      query = query.limit(limit);

      const { data, error } = await query;

      if (error) throw error;
      return data as HistorialConProducto[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos en caché
    refetchOnWindowFocus: true,
  });

  // Historial por producto específico
  const getHistorialProducto = (productoId: string) =>
    useQuery({
      queryKey: ['historial-producto', productoId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('historial_inventario')
          .select(`
            *,
            producto:productos(
              nombre_comercial,
              unidad_medida
            )
          `)
          .eq('producto_id', productoId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        return data as HistorialConProducto[];
      },
      enabled: !!productoId,
    });

  // Estadísticas del historial
  const estadisticas = {
    totalMovimientos: historial?.length || 0,
    aumentos: historial?.filter((h) => h.cantidad > 0).length || 0,
    disminuciones: historial?.filter((h) => h.cantidad < 0).length || 0,
    ajustes: historial?.filter((h) => h.tipo_movimiento === 'AJUSTE_MANUAL').length || 0,
    ventas: historial?.filter((h) => h.tipo_movimiento === 'VENTA').length || 0,
    compras: historial?.filter((h) => h.tipo_movimiento === 'COMPRA').length || 0,
  };

  // Movimientos por tipo
  const movimientosPorTipo = historial?.reduce((acc, mov) => {
    const tipo = mov.tipo_movimiento;
    if (!acc[tipo]) {
      acc[tipo] = {
        cantidad: 0,
        totalCambios: 0,
      };
    }
    acc[tipo].cantidad += 1;
    acc[tipo].totalCambios += Math.abs(mov.cantidad);
    return acc;
  }, {} as Record<TipoMovimiento, { cantidad: number; totalCambios: number }>) || {};

  // Últimos movimientos (top 10)
  const ultimosMovimientos = historial?.slice(0, 10) || [];

  // Productos más modificados
  const productosMasModificados = historial?.reduce((acc, mov) => {
    const productoId = mov.producto_id;
    if (!acc[productoId]) {
      acc[productoId] = {
        producto: mov.producto,
        cantidad: 0,
        ultimaFecha: mov.created_at,
      };
    }
    acc[productoId].cantidad += 1;
    if (new Date(mov.created_at) > new Date(acc[productoId].ultimaFecha)) {
      acc[productoId].ultimaFecha = mov.created_at;
    }
    return acc;
  }, {} as Record<string, any>);

  const topProductosModificados = Object.values(productosMasModificados || {})
    .sort((a: any, b: any) => b.cantidad - a.cantidad)
    .slice(0, 10);

  return {
    historial,
    isLoading,
    error,
    estadisticas,
    movimientosPorTipo,
    ultimosMovimientos,
    topProductosModificados,
    getHistorialProducto,
  };
}