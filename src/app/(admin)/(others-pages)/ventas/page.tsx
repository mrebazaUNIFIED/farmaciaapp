import Ventas from "@/components/pages/Ventas";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Ventas",
  description: "",
};


export default function VentasPage() {
  return (
    <div>
      <Ventas />
    </div>
  );
}