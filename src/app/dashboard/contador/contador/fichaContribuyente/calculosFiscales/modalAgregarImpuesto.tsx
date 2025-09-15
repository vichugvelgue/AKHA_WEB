import { useState, useEffect } from "react";
import { useNotification } from "@/src/hooks/useNotifications";
import MensajeNotificacion from "@/src/hooks/MensajeNotificacion";
import Cargando from "@/src/hooks/Cargando";
import { Impuesto } from "@/src/Interfaces/Interfaces";
import { API_BASE_URL } from "@/src/utils/constantes";

interface ModalAgregarImpuestoProps {
  Visible: boolean;
  idContribuyente: string;
  Cerrar: (exito: Impuesto | null) => void; // callback al cambiar
}

export default function ModalAgregarImpuesto({ Visible, idContribuyente, Cerrar }: ModalAgregarImpuestoProps) {
  if (!Visible) return null;
  const { notification, showNotification, hideNotification } = useNotification();
  const [Motivos, setMotivos] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const Guardar = async () => {
    if (!Motivos.length) {
      showNotification("El nombre es obligatorio", "error");
      return;
    }
    try {
      setIsLoading(true);
      let respuesta = await fetch(`${API_BASE_URL}/impuestos/Registrar`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: "POST",
        body: JSON.stringify({
          Nombre: Motivos,
          idCliente: idContribuyente
        } as Impuesto),
      })
      let data = await respuesta.json();
      if (respuesta.ok) {
        showNotification(data.mensaje, "success")
        Cerrar(data.data);
      } else {
        showNotification(data.mensaje, "error")
      }
      setIsLoading(false);

    } catch {
      showNotification("Ocurrio un error, intentelo mas tarde", "error")
      setIsLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.50)' }}
    >
      <div className="w-full max-w-7xl max-h-[90dvh] overflow-auto rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 scale-100 ">
        <p className="text-lg font-semibold text-gray-800">Nombre del impuesto</p>
        <input
          type="text"
          value={Motivos}
          onChange={(e) => setMotivos(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-2 mt-4"
          placeholder="Ingrese nombre del impuesto"
        />
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={() => Cerrar(null)} className="rounded-md bg-red-300 px-4 py-2 text-gray-800 transition-colors hover:bg-red-400">
            Cancelar
          </button>
          <button onClick={Guardar} className="rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
            Agregar
          </button>
        </div>
      </div>
      <Cargando isLoading={isLoading} />
      <MensajeNotificacion {...notification} hideNotification={hideNotification} />
    </div>
  );
}