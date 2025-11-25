"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState, useMemo } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useVentas } from "@/hooks/useVentas";

// Carga dinámica de ApexCharts
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlySalesChart() {
  const { ventas, isLoading } = useVentas();

  // ===============================
  //  🔥 Calcular ventas por mes
  // ===============================
  const ventasPorMes = useMemo(() => {
    const meses = Array(12).fill(0);

    if (!ventas) return meses;

    ventas.forEach((v) => {
      const fecha = new Date(v.created_at);
      const mes = fecha.getMonth(); // 0 = Enero
      const total = v.total ?? 0;   // Ajusta si tu campo es distinto

      meses[mes] += total;
    });

    return meses;
  }, [ventas]);

  // ===============================
  //  📊 ApexCharts config
  // ===============================
  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: { title: { text: undefined } },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: false },
      y: {
        formatter: (val: number) => `S/ ${val.toFixed(2)}`,
      },
    },
  };

  const series = [
    {
      name: "Ventas (S/.)",
      data: ventasPorMes,
    },
  ];

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Ventas mensuales
        </h3>

        <div className="relative inline-block">
          <button onClick={() => setIsOpen(!isOpen)} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>

          <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
            <DropdownItem onItemClick={() => setIsOpen(false)}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5">
              Ver más
            </DropdownItem>
            <DropdownItem onItemClick={() => setIsOpen(false)}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5">
              Exportar
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={180}
          />
        </div>
      </div>
    </div>
  );
}
