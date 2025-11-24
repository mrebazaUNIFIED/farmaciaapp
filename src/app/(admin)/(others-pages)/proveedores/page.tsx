import Proveedores from "@/components/pages/Proveedores";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Proveedores",
  description: "",
};

export default function ProveedoresPage() {
  return (
   <Proveedores />
  );
}