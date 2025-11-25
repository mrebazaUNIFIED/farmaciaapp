// hooks/useCompras.ts
import { CompraCompleta, CompraInsert, CompraFormData } from '@/interfaces';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export function useCompras() {
  const queryClient = useQueryClient();

  // Obtener todas las compras con relaciones
  const { data: compras, isLoading, error } = useQuery({
    queryKey: ['compras'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compras')
        .select(`
          *,
          proveedor:proveedores(*),
          detalle_compras(
            *,
            producto:productos(*)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CompraCompleta[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Obtener compras pendientes (derivado del caché)
  const comprasPendientes = compras?.filter(c => c.estado === 'PENDIENTE') || [];

  // Obtener una compra por ID
  const getCompraById = (id: string) =>
    useQuery({
      queryKey: ['compra', id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('compras')
          .select(`
            *,
            proveedor:proveedores(*),
            detalle_compras(
              *,
              producto:productos(*)
            )
          `)
          .eq('id', id)
          .single();
        
        if (error) throw error;
        return data as CompraCompleta;
      },
      enabled: !!id,
    });

  // ✅ Crear compra con actualización automática de inventario
  const createCompra = useMutation({
    mutationFn: async (compraData: CompraFormData) => {
      // Calcular el total
      const total = compraData.productos.reduce(
        (sum, p) => sum + p.cantidad * p.precio_unitario,
        0
      );

      // 1. Crear la compra principal
      const { data: compra, error: compraError } = await supabase
        .from('compras')
        .insert([{
          proveedor_id: compraData.proveedor_id,
          fecha_entrega: compraData.fecha_entrega || null,
          total,
          estado: 'PENDIENTE',
        }])
        .select()
        .single();
      
      if (compraError) throw compraError;

      // 2. Crear los detalles de la compra
      const detalles = compraData.productos.map(prod => ({
        compra_id: compra.id,
        producto_id: prod.producto_id,
        cantidad: prod.cantidad,
        precio_unitario: prod.precio_unitario,
        subtotal: prod.cantidad * prod.precio_unitario,
        lote: prod.lote || null,
        fecha_vencimiento: prod.fecha_vencimiento || null,
      }));

      const { error: detallesError } = await supabase
        .from('detalle_compras')
        .insert(detalles);
      
      if (detallesError) {
        // Si falla, eliminar la compra creada
        await supabase.from('compras').delete().eq('id', compra.id);
        throw detallesError;
      }

      // 3. Actualizar el stock de cada producto
      for (const prod of compraData.productos) {
        const { data: producto, error: prodError } = await supabase
          .from('productos')
          .select('stock_actual')
          .eq('id', prod.producto_id)
          .single();

        if (prodError) throw prodError;

        const nuevoStock = producto.stock_actual + prod.cantidad;

        const { error: updateError } = await supabase
          .from('productos')
          .update({ 
            stock_actual: nuevoStock,
            // Actualizar lote y fecha de vencimiento si se proporcionan
            ...(prod.lote && { lote: prod.lote }),
            ...(prod.fecha_vencimiento && { fecha_vencimiento: prod.fecha_vencimiento }),
          })
          .eq('id', prod.producto_id);

        if (updateError) throw updateError;

        // 4. Registrar en historial de inventario
        const { error: historialError } = await supabase
          .from('historial_inventario')
          .insert([{
            producto_id: prod.producto_id,
            tipo_movimiento: 'COMPRA',
            cantidad: prod.cantidad,
            stock_anterior: producto.stock_actual,
            stock_nuevo: nuevoStock,
            motivo: `Compra a ${compraData.proveedor_id}`,
            usuario_id: (await supabase.auth.getUser()).data.user?.id,
          }]);

        if (historialError) throw historialError;
      }

      return compra;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['historial-inventario'] });
    },
  });

  // Actualizar estado de compra
  const updateEstadoCompra = useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: string }) => {
      const { data, error } = await supabase
        .from('compras')
        .update({ estado })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
    },
  });

  return {
    compras,
    comprasPendientes,
    isLoading,
    error,
    getCompraById,
    createCompra,
    updateEstadoCompra,
  };
}