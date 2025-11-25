
import { ProductosMasVendidos } from "@/components/pages/ProductosMasVendidos";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Reportes Productos",
  description: "",
};


export default function ProductosReportesPage() {
  return (
    <div>
      <ProductosMasVendidos />
    </div>
  );
}