import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Categoria, CategoriaInsert, CategoriaUpdate } from '@/interfaces';

export function useCategorias() {
  const queryClient = useQueryClient();

  // ✅ Solo obtener todas las categorías UNA VEZ
  const { data: categorias, isLoading, error } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nombre', { ascending: true });
      
      if (error) throw error;
      return data as Categoria[];
    },
    // ✅ Configuración de caché optimizada
    staleTime: 5 * 60 * 1000, // 5 minutos - datos se consideran frescos
    gcTime: 10 * 60 * 1000,   // 10 minutos - tiempo en caché
    refetchOnWindowFocus: false, // No re-consultar al cambiar de pestaña
  });

  // ✅ Categorías activas derivadas del caché (sin query adicional)
  const categoriasActivas = categorias?.filter(cat => cat.activo) || [];

  // Crear categoría
  const createCategoria = useMutation({
    mutationFn: async (categoria: CategoriaInsert) => {
      const { data, error } = await supabase
        .from('categorias')
        .insert([categoria])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  // Actualizar categoría
  const updateCategoria = useMutation({
    mutationFn: async ({ id, ...updates }: CategoriaUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('categorias')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  // Eliminar categoría
  const deleteCategoria = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  // Activar/Desactivar categoría
  const toggleCategoriaStatus = useMutation({
    mutationFn: async ({ id, activo }: { id: string; activo: boolean }) => {
      const { data, error } = await supabase
        .from('categorias')
        .update({ activo })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  return {
    categorias,
    categoriasActivas, // ✅ Ahora es un array filtrado, no un query
    isLoading,
    error,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    toggleCategoriaStatus,
  };
}