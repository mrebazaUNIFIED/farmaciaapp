"use client";
import React from "react";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import { useProductos } from "@/hooks/useProductos";
import { useVentas } from "@/hooks/useVentas";
import { FaPills } from "react-icons/fa";

export const EcommerceMetrics = () => {
  const { productos, productosActivos, isLoading: loadingProd } = useProductos();
  const { ventas, isLoading: loadingVentas } = useVentas();

  const totalProductos = productosActivos?.length ?? 0;
  const totalVentas = ventas?.length ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      
      {/* Metric: Productos */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <FaPills className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Medicamentos activos
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loadingProd ? "..." : totalProductos}
            </h4>
          </div>
        </div>
      </div>

      {/* Metric: Ventas */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Ventas registradas
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loadingVentas ? "..." : totalVentas}
            </h4>
          </div>
        </div>
      </div>

    </div>
  );
};
