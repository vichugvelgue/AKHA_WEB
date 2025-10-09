import React, { useState, useEffect, useMemo } from "react";
import MensajeNotificacion from "@/src/hooks//MensajeNotificacion";
import { useNotification } from "@/src/hooks/useNotifications";
import { CalculoFiscal, CalculoImpuesto, Impuesto } from "@/src/Interfaces/Interfaces";
import { API_BASE_URL, convertirPesos } from "@/src/utils/constantes";
import Cargando from "@/src/hooks/Cargando";

interface ModalMotivosProps {
  Visible: boolean;
  idEditar: string;
  Ciclo: number;
  Cerrar: () => void; // callback al cambiar
}

export default function ModalCicloFiscal({ Ciclo, Visible, idEditar = "", Cerrar }: ModalMotivosProps) {
  if (!Visible) return null;
  const { notification, showNotification, hideNotification } = useNotification();
  const [loading, setloading] = useState<boolean>(false);
  const [Impuestos, setImpuestos] = useState<Impuesto[]>([]);
  const [Calculos, setCalculos] = useState<CalculoFiscal[]>();

  useEffect(() => {
    console.log({ Ciclo, Visible, idEditar });
    
    ObtenerImpuestos()
  }, []);

  
  const ObtenerImpuestos = async () => {
    setloading(true);
    try {
      const respuesta = await fetch(`${API_BASE_URL}/impuestos/ObtenerPorCliente/${idEditar}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await respuesta.json();

      if (respuesta.ok) {
        setImpuestos(data.data)
        await ObtenerInfoImpuestos()
      } else {
        showNotification(data.mensaje, "error")
      }
      setloading(false);
    } catch {
      setloading(false);
      showNotification("Ocurrio un error, intentelo mas tarde", "error")
    }
  }
  const ObtenerInfoImpuestos = async () => {
    setloading(true);
    try {
      const respuesta = await fetch(`${API_BASE_URL}/calculosfiscales/BuscarPorCiclo`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },body: JSON.stringify({
          idCliente: idEditar, 
          Ciclo
        })
      })
      const data = await respuesta.json();

      if (respuesta.ok) {
        setCalculos(data.data)
      } else {
        showNotification(data.mensaje, "error")
      }
      setloading(false);
    } catch {
      setloading(false);
      showNotification("Ocurrio un error, intentelo mas tarde", "error")
    }
  }
  const ObtenerMes = (fecha: Date) => {
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    return meses[fecha.getMonth()]; // getMonth() devuelve 0–11
  }
  const ObtenerCantidadImpuesto = (calculo: CalculoFiscal,idImpuesto: string,) => {
    let cantidad = 0

    let encontrado = calculo?.Impuestos?.find(item => item.idImpuesto == idImpuesto)
    if (encontrado) {
      cantidad = encontrado.Monto || 0
    }

    return convertirPesos(cantidad)
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
    >
      <div className="w-full max-w-7xl max-h-[90dvh] overflow-auto rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 scale-100 ">
        <div className="text-2xl font-bold text-blue-900">
          Resumen de ciclo fiscal {Ciclo}
        </div>
        <br />

        <table className="w-full rounded-2xl bg-gray-100 p-2">
          <thead>
            <tr className="border-b border-gray-500 bg-gray-200">
              <th className="text-left px-4 py-2">Mes</th>
              {
                Impuestos.map((item) =>
                  <th className="text-center px-4 py-2">{item.Nombre}</th>
                )
              }
            </tr>
          </thead>
          <tbody className="bg-white">
            {
              Calculos?.map((item) =>
                <tr key={item._id} className="border-b border-gray-400 hover:bg-gray-200">
                  <td className="px-4 py-2">{item.FechaCalculo && ObtenerMes(new Date(item.FechaCalculo))}</td>
                  {
                    Impuestos.map((impuesto) => <td className="text-center">{ObtenerCantidadImpuesto(item, impuesto._id || "")}</td>)
                  }
                </tr>
              )
            }
          </tbody>
        </table>
        
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={() => Cerrar()} className="rounded-md bg-gray-300 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-400">
            Cancelar
          </button>
        </div>

      </div>
      <Cargando isLoading={loading} />
      <MensajeNotificacion {...notification} hideNotification={hideNotification} />
    </div>
  );
}