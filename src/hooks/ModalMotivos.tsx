import { useState, useEffect } from "react";
import { useNotification } from "./useNotifications";
import MensajeNotificacion from "./MensajeNotificacion";

interface ModalMotivosProps {
  Visible: boolean;
  Mensaje: string;
  Cerrar: (exito: string) => void; // callback al cambiar
}

export default function ModalMotivos({ Visible, Mensaje = "", Cerrar }: ModalMotivosProps) {
  if (!Visible) return null;
  const { notification, showNotification, hideNotification } = useNotification();
  const [Motivos, setMotivos] = useState<string>("");

  const validarMotivos = () => {
    if (!Motivos.length) {
      showNotification("El motivo es obligatorio","error");
      return false;
    }
    Cerrar(Motivos);
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 opacity-100 backdrop-blur-sm}`}
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
    >
      <div className={`w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 scale-100`}>
        <p className="text-lg font-semibold text-gray-800">{Mensaje}</p>
        <input
          type="text"
          value={Motivos}
          onChange={(e) => setMotivos(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-2 mt-4"
          placeholder="Ingrese los motivos"
        />
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={() => Cerrar("")} className="rounded-md bg-red-300 px-4 py-2 text-gray-800 transition-colors hover:bg-red-400">
            Cancelar
          </button>
          <button onClick={validarMotivos} className="rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700">
            Aceptar
          </button>
        </div>
      </div>
      <MensajeNotificacion {...notification} hideNotification={hideNotification} />
    </div>
  );
}