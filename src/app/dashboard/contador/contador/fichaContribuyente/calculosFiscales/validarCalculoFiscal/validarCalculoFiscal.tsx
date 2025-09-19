import React, { useState, useEffect, useMemo } from "react";
import MensajeNotificacion from "@/src/hooks//MensajeNotificacion";
import { useNotification } from "@/src/hooks/useNotifications";
import { CalculoFiscal, CalculoImpuesto, EstatusValidacion, Impuesto, ValidacionCalculoFiscal } from "@/src/Interfaces/Interfaces";
import { API_BASE_URL, ObtenerSesionUsuario } from "@/src/utils/constantes";
import { createPrerenderParamsForClientSegment } from "next/dist/server/app-render/entry-base";
import Cargando from "@/src/hooks/Cargando";

interface ValidarCalculoFiscalProps {
  Visible: boolean;
  idCliente: string;
  idCalculo: string;
  idValidacion: string | null;
  Cerrar: (exito: string) => void; // callback al cambiar
}
interface Error {
  EstadoAceptacion: boolean;
  Evidencia: boolean;
  MotivosRechazo: boolean;
}

export default function ValidarCalculoFiscal({ Visible, idCliente, idCalculo,idValidacion, Cerrar }: ValidarCalculoFiscalProps) {
  if (!Visible) return null;
  const session = ObtenerSesionUsuario()
  const { notification, showNotification, hideNotification } = useNotification();
  const [loading, setloading] = useState<boolean>(false);
  const [Nuevo, setNuevo] = useState<boolean>(true);
  const [Fecha, setFecha] = useState<string>("");
  const [Error, setError] = useState<Error>({
    EstadoAceptacion:false,
    Evidencia:false,
    MotivosRechazo:false,
  });
  const [Validacion, setValidacion] = useState<ValidacionCalculoFiscal>({
    EstadoAceptacion: EstatusValidacion.Pendiente,
    Fecha: new Date(),
    idCliente: idCliente,
    idCalculo: idCalculo,
  });

  useEffect(() => {
    if (!idValidacion) {
      setNuevo(true)
      let fecha = new Date()?.toISOString().split('T')[0]
      setValidacion({
        ...Validacion,
        Fecha: new Date(fecha),
      })
    }else{
      ObtenerPorid()
    }
  }, []);

  const ObtenerPorid = async () => {
    setloading(true);
    try {
      const respuesta = await fetch(`${API_BASE_URL}/validacioncalculofiscal/ObtenerPorId/${idValidacion}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await respuesta.json();

      if (respuesta.ok) {
        setNuevo(false)
        setValidacion({ 
          ...data.data,
          Fecha: new Date(data.data.Fecha)
        })
      } else {
        showNotification(data.mensaje, "error")
      }
    } catch {
      showNotification("Ocurrio un error, intentelo mas tarde", "error")
    } finally {
      setloading(false);
    }
  }

  const SeleccionarFecha = (e: React.ChangeEvent<HTMLInputElement>) => {
    var { name, value } = e.target;
    if (name == "fecha") {
      const [ciclo, mes] = Fecha.split("-").map(Number);
      setFecha(value);
    }
  }

  const CambiarValor = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    var { name, value, type } = e.target;
    if (type == "date") {
      setValidacion({
        ...Validacion,
        [name]: new Date(value),
      })
    } else {
      setValidacion({
        ...Validacion,
        [name]: value,
      })
    }
  }

  const ValidarCampos = () => {
    let Validar = true;
    let error: Error = {
      EstadoAceptacion: false,
      MotivosRechazo: false,
      Evidencia: false,
    }

    if (Validacion.EstadoAceptacion == EstatusValidacion.Pendiente) {
      error.EstadoAceptacion = true
      Validar = false;
    } else if (Validacion.EstadoAceptacion == EstatusValidacion.Rechazado) {
      if (!Validacion.MotivosRechazo) {
        error.MotivosRechazo = true
        Validar = false;
      }
    }

    if (!Validacion.Evidencia) {
      error.Evidencia = true
      Validar = false;
    }
    if(!Validar){
      showNotification("Complete todos lo campos", "error")
    }

    setError(error)
    return Validar;
  }
  const Guardar = async () => {
    if (!ValidarCampos()) return

    setloading(true);
    try {
      let body = {
        _id: null,
        idCapturo: session.idUsuario,
        ...Validacion,
      }
      const respuesta = await fetch(`${API_BASE_URL}/validacioncalculofiscal/Guardar`, {
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
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tiposPermitidos = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
    if (!tiposPermitidos.includes(file.type)) {
      return false;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // El resultado viene como base64 en dataURL
      const base64 = reader.result as string;
      // console.log("Archivo en base64:", base64.substring(0, 100) + "..."); // solo muestra los primeros caracteres
      setValidacion({
        ...Validacion,
        Evidencia: base64,
      })
    };

    reader.readAsDataURL(file); // Convierte a Base64 (dataURL)
  };

  const handleDownload = (base64String: string | undefined) => {
    if (base64String) {
      let extencion = ".png"
      if (base64String.includes("application/pdf")) {
        extencion = ".pdf"
      }
      const link = document.createElement('a');
      link.href = base64String;
      link.download = `Evidencia`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      showNotification("No hay archivo para descargar.", "warning");
    }
  };
  const EliminarEvidencia = () => {
    setValidacion(prev => ({
      ...prev,
      Evidencia: ""
    }));
  }
  const CrearNuevaValidacion = () => {
    setNuevo(true)
    setValidacion({
      EstadoAceptacion: EstatusValidacion.Pendiente,
      Fecha: new Date(),
      idCliente: idCliente,
      idCalculo: idCalculo,
    })
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
    >
      <div className="w-full max-w-4xl max-h-[90dvh] overflow-auto rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 scale-100 ">
        <div className="text-2xl font-bold text-blue-900">
          Validación de calculo fiscal
        </div>
        <br />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="">
            <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">Fecha de validación</label>
            <input
              type="date"
              name="Fecha"
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={Validacion.Fecha?.toISOString().split('T')[0]}
              onChange={CambiarValor}
            />
          </div>
        </div>
        <br />

        <div className="w-full max-w-4xl rounded-2xl bg-gray-100 p-8 grid grid-cols-2 gap-4">
          <div className="">
            <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">Estado de aceptación</label>
            <select
              name="EstadoAceptacion"
              className={`mt-1 block w-full rounded-md bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${Error?.EstadoAceptacion ? "border-red-500" : "border-gray-300"}`}
              value={Validacion.EstadoAceptacion}
              onChange={CambiarValor}
            >
              {Object.values(EstatusValidacion).map((estatus) => (
                <option key={estatus} value={estatus}>
                  {estatus}
                </option>
              ))}
            </select>
          </div>
          <div className="">
            <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">Evidencia</label>
            {!Validacion.Evidencia && (
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, application/pdf"
              onChange={handleFileChange}
              className={`mt-1 block w-full rounded-md bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${Error?.Evidencia ? "border-red-500" : "border-gray-300"}`}
            />)}
            {Validacion.Evidencia && (
              <div className="flex">
                <button className="w-full mt-1 inline-block rounded-md bg-blue-500 px-4 py-1 text-white transition-colors duration-200 hover:bg-blue-600"
                  onClick={() => handleDownload(Validacion.Evidencia)} >
                  <i className="material-symbols-rounded filled">download</i>  </button>

                <button className="flex-none mt-1 inline-block rounded-md bg-red-500 px-4 py-1 text-white transition-colors duration-200 hover:bg-red-600"
                  onClick={() => EliminarEvidencia()} >
                  <i className="material-symbols-rounded filled">delete</i> </button>
              </div>
            )}
          </div>
          {
            Validacion.EstadoAceptacion == EstatusValidacion.Rechazado &&
          <div className="col-span-2">
            <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">Motivo de rechazo</label>
            <textarea
              name="MotivosRechazo"
              className={`mt-1 block w-full rounded-md bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${Error?.MotivosRechazo ? "border-red-500" : "border-gray-300"}`}
              value={Validacion.MotivosRechazo}
              onChange={CambiarValor}
            />
          </div>
          }
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          {(!Nuevo && Validacion.EstadoAceptacion != EstatusValidacion.Autorizado)&&
            <button onClick={CrearNuevaValidacion} className="rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
              Nuevo
            </button>
          }
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
    </div>
  );
}