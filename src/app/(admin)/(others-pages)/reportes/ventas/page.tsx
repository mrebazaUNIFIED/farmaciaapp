import { ReportesVentas } from "@/components/pages/ReportesVentas";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Reportes Ventas",
  description: "",
};


export default function ReporteVentasPage() {
  return (
    <div>
     <ReportesVentas />
    </div>
  );
}