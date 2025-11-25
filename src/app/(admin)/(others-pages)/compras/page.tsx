import { Compras } from "@/components/pages/Compras";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Compras",
  description: "",
};

export default function ComprasPage() {
  return (
    <div>
      <Compras />
    </div>
  );
}

