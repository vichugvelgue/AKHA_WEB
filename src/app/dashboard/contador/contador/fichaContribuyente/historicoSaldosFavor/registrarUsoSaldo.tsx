import React, { useState, useEffect, useMemo } from "react";
import MensajeNotificacion from "@/src/hooks//MensajeNotificacion";
import { useNotification } from "@/src/hooks/useNotifications";
import { CalculoFiscal, EstatusValidacion, HistorialSaldo, Impuesto } from "@/src/Interfaces/Interfaces";
import { API_BASE_URL,ObtenerSesionUsuario } from "@/src/utils/constantes";
import { createPrerenderParamsForClientSegment } from "next/dist/server/app-render/entry-base";
import Cargando from "@/src/hooks/Cargando";
import ModalPregunta from "@/src/hooks/ModalPregunta";

interface RegistrarUsoSaldoProps {
  Visible: boolean;
  idContribuyente: string;
  idCalculo: string;
  idImpuesto: string;
  Cerrar: (exito: string) => void; // callback al cambiar
}

export default function RegistrarUsoSaldo({ Visible, idCalculo, idImpuesto, idContribuyente = "", Cerrar }: RegistrarUsoSaldoProps) {
  if (!Visible) return null;
  const session = ObtenerSesionUsuario()
  const { notification, showNotification, hideNotification } = useNotification();
  const [loading, setloading] = useState<boolean>(false);
  const [Historial, setHistorial] = useState<HistorialSaldo>({
    idCliente: idContribuyente,
    idImpuesto,
    idCalculo,
    Fecha: new Date(),
    Monto: 0,
    Observaciones:"",
  });

  useEffect(() => {
  }, []);

  useEffect(() => {
  }, []);

  const ValidarCampos = () => {
    let Validar = true;

    if (!Historial.Monto) {
      Validar = false;
      showNotification("El monto es requerido", "error")
    }
    if (!Historial.Observaciones) {
      Validar = false;
      showNotification("Las observaciones son requeridas", "error")
    }

    return Validar;
  }
  const Guardar = async () => {
    if (!ValidarCampos()) return

    setloading(true);
    try {
      let body = {
          _id:null,
        idCapturo: session.idUsuario,
        ...Historial,
      }
      const respuesta = await fetch(`${API_BASE_URL}/historialsaldos/Guardar`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: "POST",
        body: JSON.stringify(body),
      })
      const data = await respuesta.json();

      if (respuesta.ok) {
        showNotification(data.mensaje, "success")
        Cerrar("success");
      } else {
        showNotification(data.mensaje, "error")
      }
      setloading(false);
    } catch {
      setloading(false);
      showNotification("Ocurrio un error, intentelo mas tarde", "error")
    }
  }
  const cambiarValor = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let { value, name, type } = e.target

    let valor: string | Date = value
    if (type == "date") {
      valor = new Date(value)
    }

    setHistorial({
      ...Historial,
      [name]: value
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
    >
      <div className="w-full max-w-xl max-h-[90dvh] overflow-auto rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 scale-100 ">
        <div className="text-2xl font-bold text-blue-900">
          Movimiento de saldo a favor
        </div>
        <br />
        <div className="grid grid-cols-1 gap-4">
          <div className="w-full">
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
              Fecha
            </label>
            <input
              type="date"
              name="Fecha"
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={Historial.Fecha?.toISOString().slice(0, 10)} 
              onChange={cambiarValor}
            />
          </div>
          <div className="w-full">
            <label htmlFor="Monto" className="block text-sm font-medium text-gray-700">
              Monto
            </label>
            <input
              type="number"
              name="Monto"
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={Historial.Monto || 0}
              onChange={cambiarValor}
            />
          </div>
          <div className="w-full">
            <label htmlFor="Monto" className="block text-sm font-medium text-gray-700">
              Observaciones
            </label>
            <textarea
              name="Observaciones"
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={Historial.Observaciones || ""} // YYYY-MM-DD
              onChange={cambiarValor}
            />
          </div>
        </div>
        <br />
        
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={() => Cerrar("")} className="rounded-md bg-gray-300 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-400">
            Cancelar
          </button>
            <button onClick={Guardar} className="rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
              Guardar
            </button>
        </div>

      </div>
      <Cargando isLoading={loading} />
      <MensajeNotificacion {...notification} hideNotification={hideNotification} />
    </div>
  );
}