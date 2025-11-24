import { Cliente, ClienteInsert } from '@/interfaces';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export function useClientes() {
  const queryClient = useQueryClient();

  // Obtener todos los clientes
  const { data: clientes, isLoading, error } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nombre', { ascending: true });
      
      if (error) throw error;
      return data as Cliente[];
    },
  });

  // Obtener clientes activos
  const { data: clientesActivos } = useQuery({
    queryKey: ['clientes', 'activos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('activo', true)
        .order('nombre', { ascending: true });
      
      if (error) throw error;
      return data as Cliente[];
    },
  });

  // Obtener un cliente por ID
  const getClienteById = (id: string) =>
    useQuery({
      queryKey: ['cliente', id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        return data as Cliente;
      },
      enabled: !!id,
    });

  // Buscar cliente por DNI
  const searchByDNI = async (dni: string) => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('dni', dni)
      .single();
    
    if (error) throw error;
    return data as Cliente;
  };

  // Crear cliente
  const createCliente = useMutation({
    mutationFn: async (cliente: ClienteInsert) => {
      const { data, error } = await supabase
        .from('clientes')
        .insert([cliente])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  // Actualizar cliente
  const updateCliente = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Cliente> & { id: string }) => {
      const { data, error } = await supabase
        .from('clientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  // Eliminar cliente
  const deleteCliente = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  return {
    clientes,
    clientesActivos,
    isLoading,
    error,
    getClienteById,
    searchByDNI,
    createCliente,
    updateCliente,
    deleteCliente,
  };
}