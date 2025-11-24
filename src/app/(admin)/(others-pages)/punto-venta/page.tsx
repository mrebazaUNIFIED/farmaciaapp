import { PuntoVenta } from "@/components/pages/PuntoVenta";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Punto de Venta",
  description: "",
};


export default function PuntoVentaPage() {
  return (
    <div>
      <PuntoVenta />
    </div>
  );
}