import React from "react";
import { useAuth } from "@/context/AuthContext";
import { FiLogOut } from "react-icons/fi";

export default function SidebarWidget() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = "/signin"; // redirige al login
    } catch (error) {
      console.error("Error cerrando sesión:", error);
      alert("No se pudo cerrar sesión, intenta nuevamente.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xs mx-auto my-10 bg-gray-50 dark:bg-white/5 rounded-2xl shadow-md p-6 text-center">
      

      <button
        onClick={handleSignOut}
        className="flex items-center justify-center gap-2 w-full px-4 py-3 font-medium text-white bg-brand-500 text-theme-sm hover:bg-brand-600 rounded-lg shadow  transition-colors duration-200"
      >
        <FiLogOut className="w-5 h-5" />
        Cerrar Sesión
      </button>
    </div>
  );
}
