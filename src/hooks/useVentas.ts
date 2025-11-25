import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';


import { VentaCompleta, VentaInsert } from '@/interfaces';

export function useVentas() {
	const queryClient = useQueryClient();

	// Obtener todas las ventas con relaciones
	const { data: ventas, isLoading, error } = useQuery({
		queryKey: ['ventas'],
		queryFn: async () => {
			const { data, error } = await supabase
				.from('ventas')
				.select(`
					*,
					cliente:clientes(*),
					detalle_ventas(
						*,
						producto:productos(*)
					)
				`)
				.order('created_at', { ascending: false });

			if (error) throw error;
			return data as VentaCompleta[];
		},
	});

	// Obtener ventas por rango de fechas
	const getVentasByDateRange = (inicio: string, fin: string) =>
		useQuery({
			queryKey: ['ventas', 'rango', inicio, fin],
			queryFn: async () => {
				const { data, error } = await supabase
					.from('ventas')
					.select(`
						*,
						cliente:clientes(*),
						detalle_ventas(
							*,
							producto:productos(*)
						)
					`)
					.gte('created_at', inicio)
					.lte('created_at', fin)
					.order('created_at', { ascending: false });

				if (error) throw error;
				return data as VentaCompleta[];
			},
			enabled: !!inicio && !!fin,
		});

	// Obtener una venta por ID
	const getVentaById = (id: string) =>
		useQuery({
			queryKey: ['venta', id],
			queryFn: async () => {
				const { data, error } = await supabase
					.from('ventas')
					.select(`
						*,
						cliente:clientes(*),
						detalle_ventas(
							*,
							producto:productos(*)
						)
					`)
					.eq('id', id)
					.single();

				if (error) throw error;
				return data as VentaCompleta;
			},
			enabled: !!id,
		});

	// Crear venta
	const createVenta = useMutation({
		mutationFn: async (venta: VentaInsert) => {
	console.log('Intentando insertar venta:', venta);
	const { data, error } = await supabase.from('ventas').insert([venta]).select().single();
	if (error) {
		console.error('Error detallado de Supabase:', error);
		throw error;
	}
	return data;
},
	onSuccess: () => {
		queryClient.invalidateQueries({ queryKey: ['ventas'] });
		queryClient.invalidateQueries({ queryKey: ['productos'] });
	},
	});

	// Anular venta
	const anularVenta = useMutation({
		mutationFn: async (id: string) => {
			const { data, error } = await supabase
				.from('ventas')
				.update({ estado: 'ANULADA' })
				.eq('id', id)
				.select()
				.single();

			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['ventas'] });
			queryClient.invalidateQueries({ queryKey: ['productos'] });
		},
	});

	return {
		ventas,
		isLoading,
		error,
		getVentasByDateRange,
		getVentaById,
		createVenta,
		anularVenta,
	};
}
