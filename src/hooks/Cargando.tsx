import { useEffect, useState } from "react";

interface CargandoProps {
  isLoading: boolean;
  mensaje?: string;
}

const Cargando = ({ isLoading, mensaje = "cargando..." }: CargandoProps) => {
  const [show, setShow] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShow(true);
    } else {
      // Esperar animación antes de ocultar del DOM
      const timeout = setTimeout(() => setShow(false), 100);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  if (!show) return null;

  return (
    <div
      id="divCargando"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 transition-opacity duration-100 ${
        isLoading ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="bg-white p-8 rounded-md shadow-md flex items-center">
        <div className="w-7 h-7 border-4 border-t-transparent border-gray-800 rounded-full animate-spin mr-2" />
        <p className="text-lg font-bold text-gray-800">{mensaje}</p>
      </div>
    </div>
  );
};

export default Cargando;
