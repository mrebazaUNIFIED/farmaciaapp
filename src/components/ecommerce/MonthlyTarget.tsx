"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { MoreDotIcon } from "@/icons";
import { useState, useMemo } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useVentas } from "@/hooks/useVentas";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlyTarget() {
  const { ventas } = useVentas();

  // ===============================
  //  📌 META MENSUAL (modifícala)
  // ===============================
  const META_MENSUAL = 20000;

  // ===============================
  //  🔥 Cálculo de métricas reales
  // ===============================
  const {
    ventasMes,
    ventasHoy,
    ventasMesPasado,
    progreso,
    variacionPorc
  } = useMemo(() => {
    if (!ventas) {
      return {
        ventasMes: 0,
        ventasHoy: 0,
        ventasMesPasado: 0,
        progreso: 0,
        variacionPorc: 0
      };
    }

    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const añoActual = ahora.getFullYear();

    const hoyStr = ahora.toISOString().slice(0, 10);

    let ventasDelMes = 0;
    let ventasDelDia = 0;
    let ventasDelMesPasado = 0;

    ventas.forEach((v) => {
      const fecha = new Date(v.created_at);
      const total = v.total ?? 0;

      // Mes actual
      if (fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual) {
        ventasDelMes += total;

        // Ventas hoy
        if (v.created_at.slice(0, 10) === hoyStr) {
          ventasDelDia += total;
        }
      }

      // Mes pasado
      const mesPasado = mesActual === 0 ? 11 : mesActual - 1;
      const añoMesPasado =
        mesActual === 0 ? añoActual - 1 : añoActual;

      if (fecha.getMonth() === mesPasado && fecha.getFullYear() === añoMesPasado) {
        ventasDelMesPasado += total;
      }
    });

    const avance = Math.min((ventasDelMes / META_MENSUAL) * 100, 100);

    const variacion =
      ventasDelMesPasado === 0
        ? 100
        : ((ventasDelMes - ventasDelMesPasado) / ventasDelMesPasado) * 100;

    return {
      ventasMes: ventasDelMes,
      ventasHoy: ventasDelDia,
      ventasMesPasado: ventasDelMesPasado,
      progreso: Number(avance.toFixed(2)),
      variacionPorc: Number(variacion.toFixed(1)),
    };
  }, [ventas]);

  // ===============================
  //  📊 Opciones del gráfico
  // ===============================
  const series = [progreso];

  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: { size: "80%" },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: (val) => val + "%",
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#465FFF"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Progreso"],
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Meta mensual
            </h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
              Progreso respecto a la meta del mes
            </p>
          </div>

          <div className="relative inline-block">
            <button onClick={() => setIsOpen(!isOpen)} className="dropdown-toggle">
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
              <DropdownItem
                onItemClick={() => setIsOpen(false)}
                className="w-full text-left text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                Ver más
              </DropdownItem>
              <DropdownItem
                onItemClick={() => setIsOpen(false)}
                className="w-full text-left text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                Configurar meta
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        <div className="relative">
          <div className="max-h-[330px]">
            <ReactApexChart options={options} series={series} type="radialBar" height={330} />
          </div>

          <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
            {variacionPorc > 0 ? "+" : ""}
            {variacionPorc}%
          </span>
        </div>

        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500">
          Hoy ganaste S/ {ventasHoy.toFixed(2)}, {variacionPorc >= 0 ? "más" : "menos"} que el mes pasado.
        </p>
      </div>

      <div className="flex items-center justify-center gap-6 px-6 py-4">
        <div className="text-center">
          <p className="text-gray-500 text-sm">Meta</p>
          <p className="font-semibold text-lg text-gray-800 dark:text-white/90">
            S/ {META_MENSUAL.toLocaleString()}
          </p>
        </div>

        <div className="w-px bg-gray-300 h-7"></div>

        <div className="text-center">
          <p className="text-gray-500 text-sm">Ingresos del mes</p>
          <p className="font-semibold text-lg text-gray-800 dark:text-white/90">
            S/ {ventasMes.toLocaleString()}
          </p>
        </div>

        <div className="w-px bg-gray-300 h-7"></div>

        <div className="text-center">
          <p className="text-gray-500 text-sm">Hoy</p>
          <p className="font-semibold text-lg text-gray-800 dark:text-white/90">
            S/ {ventasHoy.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
