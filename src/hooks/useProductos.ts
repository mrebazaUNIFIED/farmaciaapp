import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { ProductoConRelaciones, ProductoInsert, ProductoUpdate } from '@/interfaces';

export function useProductos() {
  const queryClient = useQueryClient();

  // ✅ UNA SOLA query principal con JOINs optimizados
  const { data: productos, isLoading, error } = useQuery({
    queryKey: ['productos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          categoria:categorias(id, nombre),
          proveedor:proveedores(id, nombre)
        `)
        .order('nombre_comercial', { ascending: true });
      
      if (error) throw error;
      return data as ProductoConRelaciones[];
    },
    // ✅ Configuración de caché optimizada
    staleTime: 5 * 60 * 1000, // 5 minutos - datos frescos
    gcTime: 10 * 60 * 1000,   // 10 minutos - tiempo en memoria
    refetchOnWindowFocus: false, // No re-consultar al cambiar de pestaña
  });

  // ✅ Derivar datos del caché (sin queries adicionales)
  const productosActivos = productos?.filter(p => p.activo) || [];
  
  const productosStockBajo = productos?.filter(p => 
    p.stock_actual < p.stock_minimo
  ) || [];
  
  const productosPorVencer = productos?.filter(p => {
    if (!p.fecha_vencimiento) return false;
    const diasParaVencer = Math.floor(
      (new Date(p.fecha_vencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return diasParaVencer <= 90 && diasParaVencer > 0;
  }).sort((a, b) => {
    const diasA = Math.floor(
      (new Date(a.fecha_vencimiento!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const diasB = Math.floor(
      (new Date(b.fecha_vencimiento!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return diasA - diasB;
  }) || [];

  // Obtener un producto por ID
  const getProductoById = (id: string) =>
    useQuery({
      queryKey: ['producto', id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('productos')
          .select(`
            *,
            categoria:categorias(id, nombre),
            proveedor:proveedores(id, nombre)
          `)
          .eq('id', id)
          .single();
        
        if (error) throw error;
        return data as ProductoConRelaciones;
      },
      enabled: !!id,
    });

  // ✅ Buscar por código de barras (sin query, usa caché)
  const searchByCodigoBarras = (codigo: string) => {
    return productos?.find(p => p.codigo_barras === codigo) || null;
  };

  // Crear producto
  const createProducto = useMutation({
    mutationFn: async (producto: ProductoInsert) => {
      const { data, error } = await supabase
        .from('productos')
        .insert([producto])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  // Actualizar producto con optimistic update
  const updateProducto = useMutation({
    mutationFn: async ({ id, ...updates }: ProductoUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('productos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    // ✅ Actualización optimista para UI instantánea
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['productos'] });
      const previousProductos = queryClient.getQueryData<ProductoConRelaciones[]>(['productos']);
      
      queryClient.setQueryData<ProductoConRelaciones[]>(['productos'], (old) =>
        old?.map((prod) =>
          prod.id === variables.id ? { ...prod, ...variables } : prod
        ) || []
      );
      
      return { previousProductos };
    },
    onError: (err, variables, context) => {
      if (context?.previousProductos) {
        queryClient.setQueryData(['productos'], context.previousProductos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  // Eliminar producto
  const deleteProducto = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  // Ajustar inventario
  const ajustarInventario = useMutation({
    mutationFn: async ({
      producto_id,
      stock_nuevo,
      motivo,
      usuario_id,
    }: {
      producto_id: string;
      stock_nuevo: number;
      motivo: string;
      usuario_id: string;
    }) => {
      const { data, error } = await supabase.rpc('ajustar_inventario', {
        p_producto_id: producto_id,
        p_stock_nuevo: stock_nuevo,
        p_motivo: motivo,
        p_usuario_id: usuario_id,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['historial-inventario'] });
    },
  });

  return {
    productos,
    productosActivos,
    productosStockBajo,
    productosPorVencer,
    isLoading,
    error,
    getProductoById,
    searchByCodigoBarras, // ✅ Ahora es una función, no async
    createProducto,
    updateProducto,
    deleteProducto,
    ajustarInventario,
  };
}