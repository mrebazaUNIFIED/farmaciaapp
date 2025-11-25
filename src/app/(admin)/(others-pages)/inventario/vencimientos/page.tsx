import { ProductosVencer } from "@/components/pages/ProductoVencer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Inventario - Vencimientos",
  description: "",
};


export default function InventarioVencimientoPage() {
  return (
    <div>
      <ProductosVencer />
    </div>
  );
}