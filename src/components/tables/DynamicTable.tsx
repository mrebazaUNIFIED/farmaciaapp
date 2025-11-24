import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

// ============ INTERFACES ============

export interface ColumnDef<T> {
  header: string;
  accessor: (row: T) => any;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

interface DynamicTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  itemsPerPage?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  minWidth?: string;
  emptyMessage?: string;
}

// ============ COMPONENTE PRINCIPAL ============

export default function DynamicTable<T>({
  data = [],
  columns = [],
  itemsPerPage = 10,
  searchable = true,
  searchPlaceholder = "Buscar...",
  minWidth = "1102px",
  emptyMessage = "No se encontraron resultados",
}: DynamicTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar datos según búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((item) => {
      return columns.some((column) => {
        const value = column.accessor(item);
        if (value === null || value === undefined) return false;
        
        // Si es un objeto, buscar en sus propiedades
        if (typeof value === "object") {
          return Object.values(value).some((v) =>
            String(v).toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, columns]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Resetear a página 1 cuando cambia la búsqueda
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Renderizar números de página con puntos suspensivos
  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(
          <button
            key={i}
            onClick={() => goToPage(i)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              currentPage === i
                ? "bg-blue-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {i}
          </button>
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push(
          <span key={i} className="px-2 text-gray-500 dark:text-gray-400">
            ...
          </span>
        );
      }
    }
    return pages;
  };

  return (
    <div className="w-full space-y-4">
      {/* Buscador */}
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors"
          />
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div style={{ minWidth }}>
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {columns.map((column, index) => (
                    <TableCell
                      key={index}
                      isHeader
                      className={`px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 ${
                        column.className || ""
                      }`}
                    >
                      {column.header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {currentData.length > 0 ? (
                  currentData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((column, colIndex) => (
                        <TableCell
                          key={colIndex}
                          className={`px-5 py-4 text-start ${
                            column.className || ""
                          }`}
                        >
                          {column.render
                            ? column.render(row, startIndex + rowIndex)
                            : column.accessor(row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                      colSpan={columns.length}
                    >
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border border-gray-200 rounded-lg dark:bg-white/[0.03] dark:border-white/[0.05]">
          {/* Información de resultados */}
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando{" "}
            <span className="font-medium">{startIndex + 1}</span> a{" "}
            <span className="font-medium">
              {Math.min(endIndex, filteredData.length)}
            </span>{" "}
            de <span className="font-medium">{filteredData.length}</span>{" "}
            resultados
          </div>

          {/* Controles de paginación */}
          <div className="flex items-center gap-2">
            {/* Botón anterior */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Números de página */}
            <div className="flex items-center gap-1">{renderPageNumbers()}</div>

            {/* Botón siguiente */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}