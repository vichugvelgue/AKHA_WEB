import { useNotification } from "@/src/hooks/useNotifications";
import MensajeNotificacion from "@/src/hooks/MensajeNotificacion";
import { useState, useEffect } from "react";
import { MetodoPago } from "@/src/Interfaces/enums";

interface ModalPagarProps {
  Visible: boolean;
  NombreCliente: string;
  idCliente: string;
  Cerrar: (exito: string) => void; // callback al cambiar
}

export default function ModalPagar({ Visible, idCliente, NombreCliente, Cerrar }: ModalPagarProps) {
  if (!Visible) return null;
  const { notification, showNotification, hideNotification } = useNotification();
  const [MetodoPagado, setMetodoPagado] = useState<MetodoPago | "">("");
  const [TotalPagar, setTotalPagar] = useState<number>(1000);
  const [MontoPagado, setMontoPagado] = useState<number>(0);
  const [Referencia, setReferencia] = useState<string>("");
  

  useEffect(() => {

  }, []);

  const validarMotivos = () => {
    if (!MetodoPago) {
      showNotification("El motivo es obligatorio","error");
      return false;
    }
    Cerrar("success");
  }
const convertirPesos = (numero: number) => {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(numero)
  }
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 opacity-100 backdrop-blur-sm}`}
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
    >
      <div className={`w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 scale-100`}>
        <h3 className="text-lg text-gray-800 mt-2"><b>Cliente:</b> {NombreCliente}</h3>
        <h3 className="text-lg text-gray-800 mt-2"><b>Total:</b> {convertirPesos(TotalPagar)}</h3>

        <h3 className="text-lg text-gray-800 mt-2">Metodo de pago:</h3>
        <select
          className="w-full border border-gray-300 rounded-md px-4 py-2 mt-4"
          value={MetodoPagado}
          onChange={(e) => setMetodoPagado(e.target.value as MetodoPago)}
        >
          <option value="" disabled>Seleccione un metodo de pago</option>
          <option value={MetodoPago.Efectivo}>Efectivo</option>
          <option value={MetodoPago.Tarjeta_credito}>Tarjeta de crédito</option>
          <option value={MetodoPago.Tarjeta_debito}>Tarjeta de debito</option>
          <option value={MetodoPago.Transferencia}>Transferencia</option>
          <option value={MetodoPago.Deposito}>Depósito</option>
          <option value={MetodoPago.Cheque}>Cheque</option>
        </select>

        {MetodoPagado === MetodoPago.Efectivo && (
          <div className="mt-4">
            <label className="block text-gray-700">
              Monto pagado:
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-4 py-2 mt-1"
                value={MontoPagado}
                onChange={(e) => setMontoPagado(Number(e.target.value))}
              />
            </label>
            <p className="text-gray-700 mt-1">
              Cambio: {convertirPesos(Math.max(0, MontoPagado - TotalPagar))}
            </p>
          </div>
        )}
        {MetodoPagado !== "" && MetodoPagado !== MetodoPago.Efectivo && (
          <div className="mt-4">
            <label className="block text-gray-700">
              Referencia:
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-4 py-2 mt-1"
                value={Referencia}
                onChange={(e) => setReferencia(e.target.value)}
              />
            </label>
          </div>
        )}

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