import Categorias from "@/components/pages/Categorias";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Categorias",
  description: "",
};

export default function CategoriasPage() {

  return (
    <div>
      <Categorias />
    </div>
  );
}