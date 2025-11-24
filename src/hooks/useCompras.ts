import { CompraCompleta, CompraInsert } from '@/interfaces';
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
  });

  // Obtener compras pendientes
  const { data: comprasPendientes } = useQuery({
    queryKey: ['compras', 'pendientes'],
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
        .eq('estado', 'PENDIENTE')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CompraCompleta[];
    },
  });

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

  // Crear compra
  const createCompra = useMutation({
    mutationFn: async (compra: CompraInsert) => {
      const { data, error } = await supabase
        .from('compras')
        .insert([compra])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
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