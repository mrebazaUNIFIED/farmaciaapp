// types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categorias: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      proveedores: {
        Row: {
          id: string
          nombre: string
          ruc: string | null
          telefono: string | null
          email: string | null
          direccion: string | null
          contacto_nombre: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          ruc?: string | null
          telefono?: string | null
          email?: string | null
          direccion?: string | null
          contacto_nombre?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          ruc?: string | null
          telefono?: string | null
          email?: string | null
          direccion?: string | null
          contacto_nombre?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      productos: {
        Row: {
          id: string
          codigo_barras: string | null
          nombre_comercial: string
          principio_activo: string | null
          categoria_id: string | null
          proveedor_id: string | null
          presentacion: string | null
          concentracion: string | null
          precio_compra: number
          precio_venta: number
          margen_ganancia: number | null
          stock_actual: number
          stock_minimo: number
          stock_maximo: number
          unidad_medida: string
          lote: string | null
          fecha_fabricacion: string | null
          fecha_vencimiento: string | null
          requiere_receta: boolean
          medicamento_controlado: boolean
          ubicacion: string | null
          temperatura_almacenamiento: string | null
          registro_sanitario: string | null
          descripcion: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          codigo_barras?: string | null
          nombre_comercial: string
          principio_activo?: string | null
          categoria_id?: string | null
          proveedor_id?: string | null
          presentacion?: string | null
          concentracion?: string | null
          precio_compra: number
          precio_venta: number
          stock_actual?: number
          stock_minimo?: number
          stock_maximo?: number
          unidad_medida?: string
          lote?: string | null
          fecha_fabricacion?: string | null
          fecha_vencimiento?: string | null
          requiere_receta?: boolean
          medicamento_controlado?: boolean
          ubicacion?: string | null
          temperatura_almacenamiento?: string | null
          registro_sanitario?: string | null
          descripcion?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          codigo_barras?: string | null
          nombre_comercial?: string
          principio_activo?: string | null
          categoria_id?: string | null
          proveedor_id?: string | null
          presentacion?: string | null
          concentracion?: string | null
          precio_compra?: number
          precio_venta?: number
          stock_actual?: number
          stock_minimo?: number
          stock_maximo?: number
          unidad_medida?: string
          lote?: string | null
          fecha_fabricacion?: string | null
          fecha_vencimiento?: string | null
          requiere_receta?: boolean
          medicamento_controlado?: boolean
          ubicacion?: string | null
          temperatura_almacenamiento?: string | null
          registro_sanitario?: string | null
          descripcion?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      clientes: {
        Row: {
          id: string
          dni: string | null
          nombre: string
          apellido: string | null
          telefono: string | null
          email: string | null
          direccion: string | null
          fecha_nacimiento: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dni?: string | null
          nombre: string
          apellido?: string | null
          telefono?: string | null
          email?: string | null
          direccion?: string | null
          fecha_nacimiento?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dni?: string | null
          nombre?: string
          apellido?: string | null
          telefono?: string | null
          email?: string | null
          direccion?: string | null
          fecha_nacimiento?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ventas: {
        Row: {
          id: string
          numero_venta: string
          cliente_id: string | null
          subtotal: number
          igv: number
          total: number
          metodo_pago: string | null
          estado: string
          usuario_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          numero_venta: string
          cliente_id?: string | null
          subtotal: number
          igv: number
          total: number
          metodo_pago?: string | null
          estado?: string
          usuario_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          numero_venta?: string
          cliente_id?: string | null
          subtotal?: number
          igv?: number
          total?: number
          metodo_pago?: string | null
          estado?: string
          usuario_id?: string | null
          created_at?: string
        }
      }
      detalle_ventas: {
        Row: {
          id: string
          venta_id: string
          producto_id: string
          cantidad: number
          precio_unitario: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          venta_id: string
          producto_id: string
          cantidad: number
          precio_unitario: number
          subtotal: number
          created_at?: string
        }
        Update: {
          id?: string
          venta_id?: string
          producto_id?: string
          cantidad?: number
          precio_unitario?: number
          subtotal?: number
          created_at?: string
        }
      }
      compras: {
        Row: {
          id: string
          numero_compra: string
          proveedor_id: string
          subtotal: number
          igv: number
          total: number
          estado: string
          fecha_entrega: string | null
          usuario_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          numero_compra: string
          proveedor_id: string
          subtotal: number
          igv: number
          total: number
          estado?: string
          fecha_entrega?: string | null
          usuario_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          numero_compra?: string
          proveedor_id?: string
          subtotal?: number
          igv?: number
          total?: number
          estado?: string
          fecha_entrega?: string | null
          usuario_id?: string | null
          created_at?: string
        }
      }
      detalle_compras: {
        Row: {
          id: string
          compra_id: string
          producto_id: string
          cantidad: number
          precio_unitario: number
          subtotal: number
          lote: string | null
          fecha_vencimiento: string | null
          created_at: string
        }
        Insert: {
          id?: string
          compra_id: string
          producto_id: string
          cantidad: number
          precio_unitario: number
          subtotal: number
          lote?: string | null
          fecha_vencimiento?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          compra_id?: string
          producto_id?: string
          cantidad?: number
          precio_unitario?: number
          subtotal?: number
          lote?: string | null
          fecha_vencimiento?: string | null
          created_at?: string
        }
      }
      historial_inventario: {
        Row: {
          id: string
          producto_id: string
          tipo_movimiento: string
          stock_anterior: number
          cantidad: number
          stock_nuevo: number
          motivo: string | null
          referencia_id: string | null
          usuario_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          producto_id: string
          tipo_movimiento: string
          stock_anterior: number
          cantidad: number
          stock_nuevo: number
          motivo?: string | null
          referencia_id?: string | null
          usuario_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          producto_id?: string
          tipo_movimiento?: string
          stock_anterior?: number
          cantidad?: number
          stock_nuevo?: number
          motivo?: string | null
          referencia_id?: string | null
          usuario_id?: string | null
          created_at?: string
        }
      }
      configuracion: {
        Row: {
          id: string
          nombre_farmacia: string | null
          ruc: string | null
          direccion: string | null
          telefono: string | null
          email: string | null
          logo_url: string | null
          igv: number
          moneda: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre_farmacia?: string | null
          ruc?: string | null
          direccion?: string | null
          telefono?: string | null
          email?: string | null
          logo_url?: string | null
          igv?: number
          moneda?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre_farmacia?: string | null
          ruc?: string | null
          direccion?: string | null
          telefono?: string | null
          email?: string | null
          logo_url?: string | null
          igv?: number
          moneda?: string
          created_at?: string
          updated_at?: string
        }
      }
      usuarios: {
        Row: {
          id: string
          nombre: string
          rol: string
          activo: boolean
          created_at: string
        }
        Insert: {
          id: string
          nombre: string
          rol?: string
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          rol?: string
          activo?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      productos_por_vencer: {
        Row: {
          id: string
          nombre_comercial: string
          categoria_nombre: string | null
          proveedor_nombre: string | null
          fecha_vencimiento: string | null
          dias_para_vencer: number | null
          stock_actual: number
          precio_venta: number
        }
      }
      productos_stock_bajo: {
        Row: {
          id: string
          nombre_comercial: string
          categoria_nombre: string | null
          stock_actual: number
          stock_minimo: number
          precio_compra: number
        }
      }
    }
    Functions: {
      ajustar_inventario: {
        Args: {
          p_producto_id: string
          p_stock_nuevo: number
          p_motivo: string
          p_usuario_id: string
        }
        Returns: void
      }
    }
    Enums: {}
  }
}