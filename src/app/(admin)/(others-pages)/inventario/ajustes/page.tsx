import { HistorialCambios } from "@/components/pages/HistorialCambios";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Inventario - Ajustes",
  description: "",
};

export default function InventarioAjustesPage() {
  return (
    <div>
      <HistorialCambios />
    </div>
  );
}