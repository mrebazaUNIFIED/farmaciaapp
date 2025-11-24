import { Proveedor, ProveedorInsert } from '@/interfaces';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export function useProveedores() {
  const queryClient = useQueryClient();

  // ✅ UNA SOLA query con configuración de caché
  const { data: proveedores, isLoading, error } = useQuery({
    queryKey: ['proveedores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .order('nombre', { ascending: true });
      
      if (error) throw error;
      return data as Proveedor[];
    },
    // ✅ Configuración de caché optimizada
    staleTime: 5 * 60 * 1000, // 5 minutos - datos frescos
    gcTime: 10 * 60 * 1000,   // 10 minutos - tiempo en memoria
    refetchOnWindowFocus: false, // No re-consultar al cambiar de pestaña
  });

  // ✅ Derivar proveedores activos del caché (sin query adicional)
  const proveedoresActivos = proveedores?.filter(prov => prov.activo) || [];

  // Obtener un proveedor por ID (sin cambios)
  const getProveedorById = (id: string) =>
    useQuery({
      queryKey: ['proveedor', id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('proveedores')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        return data as Proveedor;
      },
      enabled: !!id,
    });

  // Crear proveedor
  const createProveedor = useMutation({
    mutationFn: async (proveedor: ProveedorInsert) => {
      const { data, error } = await supabase
        .from('proveedores')
        .insert([proveedor])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
    },
  });

  // Actualizar proveedor con optimistic update
  const updateProveedor = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Proveedor> & { id: string }) => {
      const { data, error } = await supabase
        .from('proveedores')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    // ✅ Actualización optimista para UI instantánea
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['proveedores'] });
      const previousProveedores = queryClient.getQueryData<Proveedor[]>(['proveedores']);
      
      queryClient.setQueryData<Proveedor[]>(['proveedores'], (old) =>
        old?.map((prov) =>
          prov.id === variables.id ? { ...prov, ...variables } : prov
        ) || []
      );
      
      return { previousProveedores };
    },
    onError: (err, variables, context) => {
      if (context?.previousProveedores) {
        queryClient.setQueryData(['proveedores'], context.previousProveedores);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
    },
  });

  // Eliminar proveedor
  const deleteProveedor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('proveedores')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
    },
  });

  return {
    proveedores,
    proveedoresActivos, // ✅ Ahora es un array filtrado, no un query
    isLoading,
    error,
    getProveedorById,
    createProveedor,
    updateProveedor,
    deleteProveedor,
  };
}