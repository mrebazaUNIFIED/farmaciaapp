import React from "react";
import DynamicTable, { ColumnDef } from "./DynamicTable";
import Badge from "../ui/badge/Badge";
import {
  Categoria,
  Proveedor,
  ProductoConRelaciones,
  Cliente,
  VentaCompleta,
  CompraCompleta,
} from "@/interfaces";

// ============ EJEMPLO 1: TABLA DE CATEGORÍAS ============

interface CategoriasTableProps {
  categorias: Categoria[];
}

export function CategoriasTable({ categorias }: CategoriasTableProps) {
  const columns: ColumnDef<Categoria>[] = [
    {
      header: "ID",
      accessor: (row) => row.id,
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {row.id.slice(0, 8)}...
        </span>
      ),
    },
    {
      header: "Nombre",
      accessor: (row) => row.nombre,
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {row.nombre}
        </span>
      ),
    },
    {
      header: "Descripción",
      accessor: (row) => row.descripcion || "",
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {row.descripcion || "Sin descripción"}
        </span>
      ),
    },
    {
      header: "Estado",
      accessor: (row) => row.activo,
      render: (row) => (
        <Badge color={row.activo ? "success" : "error"} size="sm">
          {row.activo ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      header: "Fecha Creación",
      accessor: (row) => row.created_at,
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <DynamicTable
      data={categorias}
      columns={columns}
      itemsPerPage={10}
      searchPlaceholder="Buscar categorías..."
      emptyMessage="No hay categorías registradas"
    />
  );
}

// ============ EJEMPLO 2: TABLA DE PROVEEDORES ============

interface ProveedoresTableProps {
  proveedores: Proveedor[];
}

export function ProveedoresTable({ proveedores }: ProveedoresTableProps) {
  const columns: ColumnDef<Proveedor>[] = [
    {
      header: "Nombre",
      accessor: (row) => row.nombre,
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.nombre}
          </div>
          {row.contacto_nombre && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Contacto: {row.contacto_nombre}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "RUC",
      accessor: (row) => row.ruc || "",
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300 text-sm">
          {row.ruc || "N/A"}
        </span>
      ),
    },
    {
      header: "Teléfono",
      accessor: (row) => row.telefono || "",
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300 text-sm">
          {row.telefono || "N/A"}
        </span>
      ),
    },
    {
      header: "Email",
      accessor: (row) => row.email || "",
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300 text-sm">
          {row.email || "N/A"}
        </span>
      ),
    },
    {
      header: "Dirección",
      accessor: (row) => row.direccion || "",
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {row.direccion || "N/A"}
        </span>
      ),
    },
    {
      header: "Estado",
      accessor: (row) => row.activo,
      render: (row) => (
        <Badge color={row.activo ? "success" : "error"} size="sm">
          {row.activo ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
  ];

  return (
    <DynamicTable
      data={proveedores}
      columns={columns}
      itemsPerPage={10}
      searchPlaceholder="Buscar proveedores..."
      emptyMessage="No hay proveedores registrados"
    />
  );
}

// ============ EJEMPLO 3: TABLA DE PRODUCTOS ============

interface ProductosTableProps {
  productos: ProductoConRelaciones[];
}

export function ProductosTable({ productos }: ProductosTableProps) {
  const columns: ColumnDef<ProductoConRelaciones>[] = [
    {
      header: "Código",
      accessor: (row) => row.codigo_barras || "",
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm font-mono">
          {row.codigo_barras || "N/A"}
        </span>
      ),
    },
    {
      header: "Producto",
      accessor: (row) => row.nombre_comercial,
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.nombre_comercial}
          </div>
          {row.principio_activo && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {row.principio_activo}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Categoría",
      accessor: (row) => row.categoria?.nombre || "",
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300 text-sm">
          {row.categoria?.nombre || "Sin categoría"}
        </span>
      ),
    },
    {
      header: "Stock",
      accessor: (row) => row.stock_actual,
      render: (row) => (
        <div className="text-sm">
          <span
            className={`font-medium ${
              row.stock_actual <= row.stock_minimo
                ? "text-red-600 dark:text-red-400"
                : row.stock_actual <= row.stock_minimo * 1.5
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {row.stock_actual}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            {" "}
            / {row.stock_minimo}
          </span>
        </div>
      ),
    },
    {
      header: "Precio Venta",
      accessor: (row) => row.precio_venta,
      render: (row) => (
        <span className="text-gray-900 dark:text-white font-medium">
          S/ {row.precio_venta.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Estado",
      accessor: (row) => row.activo,
      render: (row) => (
        <Badge color={row.activo ? "success" : "error"} size="sm">
          {row.activo ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
  ];

  return (
    <DynamicTable
      data={productos}
      columns={columns}
      itemsPerPage={15}
      searchPlaceholder="Buscar productos por nombre, código o categoría..."
      emptyMessage="No hay productos registrados"
      minWidth="1200px"
    />
  );
}

// ============ EJEMPLO 4: TABLA DE CLIENTES ============

interface ClientesTableProps {
  clientes: Cliente[];
}

export function ClientesTable({ clientes }: ClientesTableProps) {
  const columns: ColumnDef<Cliente>[] = [
    {
      header: "Cliente",
      accessor: (row) => row.nombre,
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.nombre} {row.apellido}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {row.dni}: {row.dni}
          </div>
        </div>
      ),
    },
    {
      header: "Teléfono",
      accessor: (row) => row.telefono || "",
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300 text-sm">
          {row.telefono || "N/A"}
        </span>
      ),
    },
    {
      header: "Email",
      accessor: (row) => row.email || "",
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300 text-sm">
          {row.email || "N/A"}
        </span>
      ),
    },
    {
      header: "Dirección",
      accessor: (row) => row.direccion || "",
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {row.direccion || "N/A"}
        </span>
      ),
    },
    {
      header: "Fecha Registro",
      accessor: (row) => row.created_at,
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Estado",
      accessor: (row) => row.activo,
      render: (row) => (
        <Badge color={row.activo ? "success" : "error"} size="sm">
          {row.activo ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
  ];

  return (
    <DynamicTable
      data={clientes}
      columns={columns}
      itemsPerPage={10}
      searchPlaceholder="Buscar clientes por nombre, documento o teléfono..."
      emptyMessage="No hay clientes registrados"
    />
  );
}

// ============ EJEMPLO 5: TABLA DE VENTAS ============

interface VentasTableProps {
  ventas: VentaCompleta[];
}

export function VentasTable({ ventas }: VentasTableProps) {
  const columns: ColumnDef<VentaCompleta>[] = [
    {
      header: "Nº Venta",
      accessor: (row) => row.numero_venta,
      render: (row) => (
        <span className="text-gray-900 dark:text-white font-medium">
          #{row.numero_venta}
        </span>
      ),
    },
    {
      header: "Cliente",
      accessor: (row) => row.cliente?.nombre || "Cliente General",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white text-sm">
            {row.cliente
              ? `${row.cliente.nombre} ${row.cliente.apellido}`
              : "Cliente General"}
          </div>
          {row.cliente && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {row.cliente.dni}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Fecha",
      accessor: (row) => row.created_at,
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300 text-sm">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Total",
      accessor: (row) => row.total,
      render: (row) => (
        <span className="text-gray-900 dark:text-white font-semibold">
          S/ {row.total.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Método Pago",
      accessor: (row) => row.metodo_pago,
      render: (row) => (
        <Badge
          color={
            row.metodo_pago === "Efectivo"
              ? "success"
              : row.metodo_pago === "Yape"
              ? "primary"
              : "warning"
          }
          size="sm"
        >
          {row.metodo_pago}
        </Badge>
      ),
    },
    {
      header: "Estado",
      accessor: (row) => row.estado,
      render: (row) => (
        <Badge
          color={row.estado === "COMPLETADA" ? "success" : "error"}
          size="sm"
        >
          {row.estado}
        </Badge>
      ),
    },
  ];

  return (
    <DynamicTable
      data={ventas}
      columns={columns}
      itemsPerPage={15}
      searchPlaceholder="Buscar ventas por número, cliente o método de pago..."
      emptyMessage="No hay ventas registradas"
    />
  );
}

// ============ EJEMPLO 6: TABLA DE COMPRAS ============

interface ComprasTableProps {
  compras: CompraCompleta[];
}

export function ComprasTable({ compras }: ComprasTableProps) {
  const columns: ColumnDef<CompraCompleta>[] = [
    {
      header: "Nº Compra",
      accessor: (row) => row.numero_compra,
      render: (row) => (
        <span className="text-gray-900 dark:text-white font-medium">
          #{row.numero_compra}
        </span>
      ),
    },
    {
      header: "Proveedor",
      accessor: (row) => row.proveedor.nombre,
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white text-sm">
            {row.proveedor.nombre}
          </div>
          {row.proveedor.ruc && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              RUC: {row.proveedor.ruc}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Fecha Compra",
      accessor: (row) => row.created_at,
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300 text-sm">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Fecha Entrega",
      accessor: (row) => row.fecha_entrega || "",
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300 text-sm">
          {row.fecha_entrega
            ? new Date(row.fecha_entrega).toLocaleDateString()
            : "No definida"}
        </span>
      ),
    },
    {
      header: "Total",
      accessor: (row) => row.total,
      render: (row) => (
        <span className="text-gray-900 dark:text-white font-semibold">
          S/ {row.total.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Estado",
      accessor: (row) => row.estado,
      render: (row) => (
        <Badge
          color={
            row.estado === "COMPLETADA"
              ? "success"
              : row.estado === "PENDIENTE"
              ? "warning"
              : "error"
          }
          size="sm"
        >
          {row.estado}
        </Badge>
      ),
    },
  ];

  return (
    <DynamicTable
      data={compras}
      columns={columns}
      itemsPerPage={15}
      searchPlaceholder="Buscar compras por número, proveedor o estado..."
      emptyMessage="No hay compras registradas"
    />
  );
}