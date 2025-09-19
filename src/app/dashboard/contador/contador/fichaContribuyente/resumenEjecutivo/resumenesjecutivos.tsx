import React, { useState, useEffect, useMemo } from "react";
import MensajeNotificacion from "@/src/hooks//MensajeNotificacion";
import { useNotification } from "@/src/hooks/useNotifications";
import { CalculoFiscal, CalculoImpuesto, Cliente, Impuesto, ResumenEjecutivo } from "@/src/Interfaces/Interfaces";
import { API_BASE_URL,ObtenerSesionUsuario } from "@/src/utils/constantes";
import { createPrerenderParamsForClientSegment } from "next/dist/server/app-render/entry-base";
import Cargando from "@/src/hooks/Cargando";
import FormatoResumenEjecutivo from "@/src/formatos/resuemenEjecutivo";

interface ModalMotivosProps {
  Visible: boolean;
  idEditar: string;
  Cerrar: (exito: string) => void; // callback al cambiar
}

export default function ResumenesEjecutivos({ Visible, idEditar = "", Cerrar }: ModalMotivosProps) {
  if (!Visible) return null;
  const session = ObtenerSesionUsuario()
  const { notification, showNotification, hideNotification } = useNotification();
  const [showImprimir, setShowImprimir] = useState<boolean>(false);
  const [loading, setloading] = useState<boolean>(false);
  const [Nuevo, setNuevo] = useState<boolean>(false);
  const [Fecha, setFecha] = useState<string>("");
  const [Resumen, setResumen] = useState<ResumenEjecutivo>({
    Ingresos:"",
    Egresos:"",
    Nominas:"",
    ImpuestosFederales:"",
    idCliente: idEditar,
  });
  const [cliente, setCliente] = useState<Cliente>();

  useEffect(() => {
    const ahora = new Date();
    setFecha(ahora.toISOString().substring(0, 7)); // YYYY-MM
    NuevoResumen();
  }, []);

  useEffect(() => {
    BuscarPorMes();
  }, [Fecha]);
  

  const BuscarPorMes = async () => {
    setloading(true);
    try {
      if (!Fecha) return
      let [ciclo, mes] = Fecha.split("-").map(Number);
      const respuesta = await fetch(`${API_BASE_URL}/resumenejecutivo/BuscarPorMesCliente`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: "POST",
        body: JSON.stringify({
          idCliente: idEditar,
          Mes: mes,
          Ciclo: ciclo,
        }),
      })
      const data = await respuesta.json();

      if (respuesta.ok) {
        if (data.data) {
          setNuevo(false);
          setResumen(data.data)
        } else {
          NuevoResumen()
        }
      } else {
        showNotification(data.mensaje, "error")
      }
      setloading(false);
    } catch {
      setloading(false);
      showNotification("Ocurrio un error, intentelo mas tarde", "error")
    }
  }

  const SeleccionarFecha = (e: React.ChangeEvent<HTMLInputElement>) => {
    var { name, value } = e.target;
    if (name == "fecha") {
      const [ciclo, mes] = Fecha.split("-").map(Number);
      setFecha(value);
    }
  }
  const NuevoResumen = () => {
    const [ciclo, mes] = Fecha.split("-").map(Number);

    setNuevo(true);
    setResumen({
      FechaResumen: new Date(ciclo, mes - 1, 1, 12, 0),
      Ingresos: "",
      Egresos: "",
      Nominas: "",
      ImpuestosFederales: "",
      idCliente: idEditar,
    });
  };

  const CambiarValorResuemn = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
      setResumen({
        ...Resumen,
        [name]:value,
      })
  }
  const ValidarCampos = () => {
    let Validar = true;

    // Calculo.Impuestos?.forEach(item => {
    //   if (item.Monto == 0) {
    //     Validar = false;
    //     showNotification("El monto es requerido en todos los impuestos", "error")
    //   }
    // });

    return Validar;
  }
  const Guardar = async () => {
    if (!ValidarCampos()) return

    setloading(true);
    try {
      let body = {
          _id:null,
        idCapturo: session.idUsuario,
        ...Resumen,
        FechaCalculo: Fecha + "-01T12:00",
      }
      const respuesta = await fetch(`${API_BASE_URL}/resumenejecutivo/Guardar`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: "POST",
        body: JSON.stringify(body),
      })
      const data = await respuesta.json();

      if (respuesta.ok) {
        await imprimir()
        Cerrar("success");
      } else {
        showNotification(data.mensaje, "error")
      }
    } catch {
      showNotification("Ocurrio un error, intentelo mas tarde", "error")
    } finally {
      setloading(false);
    }
  }
  const imprimir = async()=>{
    return new Promise(async(resolve, reject) => {
      await obtenerInformacionCliente()
      setResumen({
        ...Resumen,
        FechaRegistro: new Date(Fecha + "-01T12:00"),
      })
      setShowImprimir(true)
      setTimeout(() =>{
         setShowImprimir(false)
         resolve(true)
        }, 500)
    })
  }
  const obtenerInformacionCliente=async()=>{
    setloading(true);
    try {
      const respuesta = await fetch(`${API_BASE_URL}/clientes/ObtenerCliente/${idEditar}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: "GET",
      })
      const data = await respuesta.json();

      if (respuesta.ok) {
        setCliente(data.data)
      } else {
        showNotification(data.mensaje, "error")
      }
    } catch {
      showNotification("Ocurrio un error, intentelo mas tarde", "error")
    } finally {
      setloading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
    >
      <div className="w-full max-w-4xl max-h-[90dvh] overflow-auto rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 scale-100 ">
        <div className="text-2xl font-bold text-blue-900">
          Resumen ejecutivo
        </div>
        <br />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="">
            <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">Seleccionar mes y año</label>
            <input
              type="month"
              name="fecha"
              id="fecha"
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={Fecha}
              onChange={SeleccionarFecha}
            />
          </div>
          <div className="grid justify-items-end"/>
          <div className="grid justify-items-end">
            {!Nuevo &&
              <button className="mt-3 inline-block rounded-md bg-yellow-600 px-4 py-1 text-white transition-colors hover:bg-yellow-700"
               onClick={imprimir}>
                Imprimir
              </button>
            }
          </div>
        </div>
        <br />

        <div className="w-full max-w-4xl rounded-2xl bg-gray-100 p-8">
          <div className="grid grid-cols-[auto_1fr] gap-y-4">
            <div className="p-4">Ingresos</div>
            <div className="p-4">
              <textarea
                name="Ingresos"
                onChange={CambiarValorResuemn}
                value={Resumen.Ingresos}
                className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white"
              />
            </div>

            <div className="p-4">Egresos</div>
            <div className="p-4">
              <textarea
                name="Egresos"
                onChange={CambiarValorResuemn}
                value={Resumen.Egresos}
                className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white"
              />
            </div>

            <div className="p-4">Nóminas - IMSS - INFONAVIT</div>
            <div className="p-4">
              <textarea
                name="Nominas"
                onChange={CambiarValorResuemn}
                value={Resumen.Nominas}
                className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white"
              />
            </div>

            <div className="p-4">Pagos de impuestos federale</div>
            <div className="p-4">
              <textarea
                name="ImpuestosFederales"
                onChange={CambiarValorResuemn}
                value={Resumen.ImpuestosFederales}
                className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={() => Cerrar("")} className="rounded-md bg-gray-300 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-400">
            Cancelar
          </button>
          {Nuevo &&
            <button onClick={Guardar} className="rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
              Guardar
            </button>
          }
        </div>

      </div>
      <Cargando isLoading={loading} />
      <MensajeNotificacion {...notification} hideNotification={hideNotification} />
      {showImprimir && cliente && <FormatoResumenEjecutivo resumen={Resumen} contribuyente={cliente}/>}
    </div>
  );
}