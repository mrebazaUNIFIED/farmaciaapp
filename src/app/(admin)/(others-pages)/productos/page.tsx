
import { Productos } from "@/components/pages/Productos";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Productos",
  description: "",
};


export default function ProductosPage() {
  return (
    <div>
      <Productos />
    </div>
  );
}