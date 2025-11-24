'use client'
import { toast } from 'sonner' // Importa en el componente/hook

import { useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useProductos } from '@/hooks/useProductos'
import { useVentas } from '@/hooks/useVentas'
import { useAuth } from '@/hooks/useAuth'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

import { Search, Trash2, ShoppingCart, AlertCircle } from 'lucide-react' 
import { formatCurrency } from '@/lib/utils'
import { Usuario } from '@/interfaces' // Importa el tipo Usuario desde las interfaces

interface ItemCarrito {
	producto_id: string
	nombre: string
	precio: number
	cantidad: number
	subtotal: number
}

// Componentes UI creados desde cero con Tailwind
const Card = ({ className = '', children }: { className?: string; children: ReactNode }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ className = '', children }: { className?: string; children: ReactNode }) => (
  <div className={`px-4 py-5 border-b border-gray-200 ${className}`}>
    {children}
  </div>
)

const CardTitle = ({ className = '', children }: { className?: string; children: ReactNode }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
)

const CardContent = ({ className = '', children }: { className?: string; children: ReactNode }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
)

const Input = ({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    {...props}
  />
)

const Button = ({ 
  variant = 'default', 
  size = 'default', 
  className = '', 
  children, 
  ...props 
}: { 
  variant?: 'default' | 'outline' | 'ghost'; 
  size?: 'default' | 'sm' | 'lg' | 'icon'; 
  className?: string; 
  children: ReactNode; 
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  let baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-blue-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-900 focus:ring-blue-500',
  }[variant]

  const sizeClasses = {
    default: 'h-10 py-2 px-4',
    sm: 'h-8 px-2 text-sm',
    lg: 'h-12 px-6 text-lg',
    icon: 'h-10 w-10',
  }[size]

  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

const Label = ({ className = '', children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-sm font-medium text-gray-700 ${className}`} {...props}>
    {children}
  </label>
)

const Select = ({ 
  value, 
  onValueChange, 
  children 
}: { 
  value: string; 
  onValueChange: (value: string) => void; 
  children: ReactNode 
}) => (
  <select 
    value={value} 
    onChange={(e) => onValueChange(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  >
    {children}
  </select>
)

const SelectItem = ({ value, children }: { value: string; children: ReactNode }) => (
  <option value={value}>{children}</option>
)

// Nota: Para simplificar, usamos un <select> nativo en lugar de un componente complejo como en shadcn.
// SelectTrigger, SelectValue, SelectContent no son necesarios con este enfoque.

export const PuntoVenta = () => {
  const router = useRouter()
  const { user } = useAuth()
  const { productos } = useProductos()
  const { createVenta } = useVentas()
  const queryClient = useQueryClient()

  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [loading, setLoading] = useState(false)



  
  const productosFiltrados = productos?.filter((p) =>
    p.nombre_comercial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.concentracion?.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? []

  const agregarAlCarrito = (producto: any) => {
    const itemExistente = carrito.find(item => item.producto_id === producto.id)

    if (itemExistente) {
      setCarrito(carrito.map(item =>
        item.producto_id === producto.id
          ? { 
              ...item, 
              cantidad: item.cantidad + 1,
              subtotal: (item.cantidad + 1) * item.precio
            }
          : item
      ))
    } else {
      setCarrito([
        ...carrito,
        {
          producto_id: producto.id,
          nombre: producto.nombre_comercial || producto.nombre, // Usar nombre_comercial si existe, fallback a nombre
          precio: producto.precio_venta,
          cantidad: 1,
          subtotal: producto.precio_venta
        }
      ])
    }
    setSearchTerm('')
  }

  const actualizarCantidad = (producto_id: string, cantidad: number) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(producto_id)
      return
    }

    setCarrito(carrito.map(item =>
      item.producto_id === producto_id
        ? { ...item, cantidad, subtotal: cantidad * item.precio }
        : item
    ))
  }

  const eliminarDelCarrito = (producto_id: string) => {
    setCarrito(carrito.filter(item => item.producto_id !== producto_id))
  }

  const calcularTotal = () => {
    return carrito.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const procesarVenta = async () => {
    if (carrito.length === 0) {
      toast.error('El carrito está vacío 🛒')
      return
    }

    setLoading(true)
    try {
      const venta = {
        cliente_id: null,
        user_id: user?.id || null,
        total: calcularTotal(),
        metodo_pago: metodoPago,
        estado: 'completada',
        notas: null,
      }

      const createdVenta = await createVenta.mutateAsync(venta);
      const venta_id = createdVenta.id;

      const detalles = carrito.map(item => ({
        venta_id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        subtotal: item.subtotal,
      }))

      const { error: detallesError } = await supabase
        .from('detalle_ventas')
        .insert(detalles);

      if (detallesError) throw detallesError;

      toast.success('Venta registrada exitosamente 🎉')
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      router.push('/ventas')
    } catch (error: any) {
      console.error(error)
      if (error.code === '42501') {
        toast.error('Error de permisos: Verifica tu sede asignada o contacta al admin ⚠️')
      } else {
        toast.error(`Error al procesar la venta: ${error.message || 'Desconocido'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Registrar Venta</h1>
        <p className="text-slate-500 mt-1">
          Punto de venta - Agrega productos al carrito
         
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de búsqueda de productos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Buscar Productos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar por nombre o concentración..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {searchTerm && (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {productosFiltrados.map((producto) => (
                  <div
                    key={producto.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => agregarAlCarrito(producto)}
                  >
                    <div>
                      <p className="font-medium">{producto.nombre_comercial}</p>
                      <p className="text-sm text-slate-500">{producto.codigo_barras}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(producto.precio_venta)}</p>
                    </div>
                  </div>
                ))}
                {productosFiltrados.length === 0 && (
                  <p className="text-center text-slate-500 py-4">
                    No se encontraron productos
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Carrito */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Carrito ({carrito.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {carrito.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                El carrito está vacío
              </p>
            ) : (
              <>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {carrito.map((item) => (
                    <div key={item.producto_id} className="border border-gray-200 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-sm">{item.nombre}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => eliminarDelCarrito(item.producto_id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => actualizarCantidad(item.producto_id, item.cantidad - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.cantidad}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => actualizarCantidad(item.producto_id, item.cantidad + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="space-y-2">
                    <Label>Método de Pago</Label>
                    <Select value={metodoPago} onValueChange={setMetodoPago}>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                    </Select>
                  </div>

                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(calcularTotal())}</span>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={procesarVenta}
                    disabled={loading }
                  >
                    {loading ? 'Procesando...' : 'Procesar Venta'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}