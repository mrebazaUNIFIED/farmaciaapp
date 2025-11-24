// types/index.ts
import { Database } from './database.types';

// ============ TIPOS BASE DE LAS TABLAS ============

export type Categoria = Database['public']['Tables']['categorias']['Row'];
export type Proveedor = Database['public']['Tables']['proveedores']['Row'];
export type Producto = Database['public']['Tables']['productos']['Row'];
export type Cliente = Database['public']['Tables']['clientes']['Row'];
export type Venta = Database['public']['Tables']['ventas']['Row'];
export type DetalleVenta = Database['public']['Tables']['detalle_ventas']['Row'];
export type Compra = Database['public']['Tables']['compras']['Row'];
export type DetalleCompra = Database['public']['Tables']['detalle_compras']['Row'];
export type HistorialInventario = Database['public']['Tables']['historial_inventario']['Row'];
export type Configuracion = Database['public']['Tables']['configuracion']['Row'];
export type Usuario = Database['public']['Tables']['usuarios']['Row'];

// ============ TIPOS PARA INSERTS ============

export type CategoriaInsert = Database['public']['Tables']['categorias']['Insert'];
export type ProveedorInsert = Database['public']['Tables']['proveedores']['Insert'];
export type ProductoInsert = Database['public']['Tables']['productos']['Insert'];
export type ClienteInsert = Database['public']['Tables']['clientes']['Insert'];
export type VentaInsert = Database['public']['Tables']['ventas']['Insert'];
export type DetalleVentaInsert = Database['public']['Tables']['detalle_ventas']['Insert'];
export type CompraInsert = Database['public']['Tables']['compras']['Insert'];
export type DetalleCompraInsert = Database['public']['Tables']['detalle_compras']['Insert'];

// ============ TIPOS PARA UPDATES ============

export type CategoriaUpdate = Database['public']['Tables']['categorias']['Update'];
export type ProveedorUpdate = Database['public']['Tables']['proveedores']['Update'];
export type ProductoUpdate = Database['public']['Tables']['productos']['Update'];
export type ClienteUpdate = Database['public']['Tables']['clientes']['Update'];
export type VentaUpdate = Database['public']['Tables']['ventas']['Update'];
export type CompraUpdate = Database['public']['Tables']['compras']['Update'];

// ============ INTERFACES EXTENDIDAS CON RELACIONES ============

// Producto con relaciones
export interface ProductoConRelaciones extends Producto {
  categoria?: Categoria | null;
  proveedor?: Proveedor | null;
}

// Venta completa con detalles
export interface VentaCompleta extends Venta {
  cliente?: Cliente | null;
  detalle_ventas: (DetalleVenta & {
    producto: Producto;
  })[];
}

// Compra completa con detalles
export interface CompraCompleta extends Compra {
  proveedor: Proveedor;
  detalle_compras: (DetalleCompra & {
    producto: Producto;
  })[];
}

// Historial de inventario con producto
export interface HistorialConProducto extends HistorialInventario {
  producto: Producto;
}

// ============ INTERFACES PARA FORMULARIOS ============

export interface ProductoFormData {
  codigo_barras?: string;
  nombre_comercial: string;
  principio_activo?: string;
  categoria_id?: string;
  proveedor_id?: string;
  presentacion?: string;
  concentracion?: string;
  precio_compra: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  unidad_medida: string;
  lote?: string;
  fecha_fabricacion?: string;
  fecha_vencimiento?: string;
  requiere_receta: boolean;
  medicamento_controlado: boolean;
  ubicacion?: string;
  temperatura_almacenamiento?: string;
  registro_sanitario?: string;
  descripcion?: string;
}

export interface CategoriaFormData {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface ProveedorFormData {
  nombre: string;
  ruc?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  contacto_nombre?: string;
  activo?: boolean;
}

export interface ClienteFormData {
  dni?: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  fecha_nacimiento?: string;
  activo?: boolean;
}

export interface VentaFormData {
  cliente_id?: string;
  metodo_pago: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  productos: {
    producto_id: string;
    cantidad: number;
    precio_unitario: number;
  }[];
}

export interface CompraFormData {
  proveedor_id: string;
  fecha_entrega?: string;
  productos: {
    producto_id: string;
    cantidad: number;
    precio_unitario: number;
    lote?: string;
    fecha_vencimiento?: string;
  }[];
}

// ============ TIPOS PARA ESTADÍSTICAS ============

export interface EstadisticasVentas {
  totalVentas: number;
  ventasHoy: number;
  ventasSemana: number;
  ventasMes: number;
  productosMasVendidos: {
    producto: Producto;
    cantidad: number;
    total: number;
  }[];
}

export interface EstadisticasInventario {
  totalProductos: number;
  productosStockBajo: number;
  productosPorVencer: number;
  valorInventario: number;
}

export interface EstadisticasGenerales {
  ventas: EstadisticasVentas;
  inventario: EstadisticasInventario;
  ingresosMes: number;
  clientesActivos: number;
}

// ============ TIPOS PARA ALERTAS ============

export type TipoAlerta = 'stock_bajo' | 'por_vencer' | 'vencido';

export interface Alerta {
  tipo: TipoAlerta;
  producto: Producto;
  mensaje: string;
  prioridad: 'alta' | 'media' | 'baja';
}

// ============ ENUMS Y CONSTANTES ============

export const METODOS_PAGO = ['Efectivo', 'Tarjeta', 'Transferencia'] as const;
export type MetodoPago = typeof METODOS_PAGO[number];

export const ESTADOS_VENTA = ['COMPLETADA', 'ANULADA'] as const;
export type EstadoVenta = typeof ESTADOS_VENTA[number];

export const ESTADOS_COMPRA = ['COMPLETADA', 'PENDIENTE', 'ANULADA'] as const;
export type EstadoCompra = typeof ESTADOS_COMPRA[number];

export const TIPOS_MOVIMIENTO = [
  'AJUSTE_MANUAL',
  'VENTA',
  'COMPRA',
  'DEVOLUCION',
  'VENCIDO',
  'DAÑADO',
  'ROBO',
  'MERMA',
  'DONACION'
] as const;
export type TipoMovimiento = typeof TIPOS_MOVIMIENTO[number];

export const UNIDADES_MEDIDA = ['Unidad', 'Caja', 'Frasco', 'Blister', 'Sobre'] as const;
export type UnidadMedida = typeof UNIDADES_MEDIDA[number];

export const TEMPERATURAS = ['Ambiente', '2-8°C', '15-25°C', 'Refrigeración'] as const;
export type Temperatura = typeof TEMPERATURAS[number];

export const TIPOS_DOCUMENTO = ['DNI', 'RUC', 'Pasaporte', 'Carnet de Extranjería'] as const;
export type TipoDocumento = typeof TIPOS_DOCUMENTO[number];

// ============ TIPOS PARA REPORTES ============

export interface ReporteVentas {
  fecha: string;
  total: number;
  cantidad_ventas: number;
  metodo_pago: MetodoPago;
}

export interface ReporteProductos {
  producto: ProductoConRelaciones;
  cantidad_vendida: number;
  total_vendido: number;
}

export interface ReporteClientes {
  cliente: Cliente;
  total_compras: number;
  monto_total: number;
  ultima_compra: string;
}

// ============ TIPOS PARA VISTAS DE SUPABASE ============

export interface ProductoStockBajo {
  id: string;
  nombre_comercial: string;
  categoria_nombre: string | null;
  stock_actual: number;
  stock_minimo: number;
  precio_compra: number;
}

export interface ProductoPorVencer {
  id: string;
  nombre_comercial: string;
  categoria_nombre: string | null;
  proveedor_nombre: string | null;
  fecha_vencimiento: string | null;
  dias_para_vencer: number | null;
  stock_actual: number;
  precio_venta: number;
}