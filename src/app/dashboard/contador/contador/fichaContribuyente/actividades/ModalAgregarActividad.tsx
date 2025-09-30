import { useNotification } from "@/src/hooks/useNotifications";
import MensajeNotificacion from "@/src/hooks/MensajeNotificacion";
import { useState, useEffect } from "react";
import { ActividadPeriodica } from "@/src/Interfaces/Interfaces";
import { InicioSemana } from "@/src/Interfaces/enums";
import { API_BASE_URL, ObtenerSesionUsuario } from "@/src/utils/constantes";
import Cargando from "@/src/hooks/Cargando";

interface ModalAgregarActividadProps {
  idContribuyente?: string;
  Visible: boolean;
  Cerrar: (exito: string) => void; // callback al cambiar
}
class errorAgregarActividad {
  FechaInicio: boolean = false
  FechaVencimiento: boolean = false
  Nombre: boolean = false
}
export default function ModalAgregarActividad({ idContribuyente = "", Visible, Cerrar }: ModalAgregarActividadProps) {
  if (!Visible) return null;
  const session = ObtenerSesionUsuario()
  const { notification, showNotification, hideNotification } = useNotification();
  const [Actividad, setActividad] = useState<ActividadPeriodica>({
    idCliente: idContribuyente,
    Nombre: "",
    SemanaOperativa: 1,
    FechaInicio: new Date(),
    FechaVencimiento: new Date(),
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [Motivos, setMotivos] = useState<string>("");
  const [Errores, setErrores] = useState<errorAgregarActividad>(new errorAgregarActividad());

  const validarDatos = () => {
    let valido = true
    let error = new errorAgregarActividad()

    let fechaInicioMes = new Date()
    fechaInicioMes.setDate(1)
    fechaInicioMes.setHours(0,0,0,0)
    let fechaFinMes = new Date()
    fechaFinMes.setMonth(fechaFinMes.getMonth()+1,1)
    fechaFinMes.setHours(0,0,0,0)
    
    if (!Actividad.Nombre) {
      error.Nombre = true
      valido = false
    }
    if (Actividad.FechaInicio < fechaInicioMes || Actividad.FechaInicio > fechaFinMes) {
      error.FechaInicio = true
      valido = false
    }
    if (Actividad.FechaVencimiento < Actividad.FechaInicio) {
      error.FechaVencimiento = true
      valido = false
    }
    console.log(error);

    setErrores(error)
    if(!valido){
      showNotification("Todos los campos son necesarios", "warning")
    }

    return valido
  }

  const Guardar = async() => {
    if (!validarDatos()) return

    Actividad.SemanaOperativa = await ObtenerSemana(Actividad.FechaInicio)

    try {
      let body: ActividadPeriodica = {
        idUsuarioRegistro: session.idUsuario,
        ...Actividad,
      }
      const respuesta = await fetch(`${API_BASE_URL}/actividadesperiodicas/Guardar`, {
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
      setIsLoading(false);
    } catch {
      setIsLoading(false);
      showNotification("Ocurrio un error, intentelo mas tarde", "error")
    }
  }
  const ObtenerSemana = async(fechainicio: Date) => {
    let dia = fechainicio.getDate()

    let semana = 1
    if (dia >= InicioSemana.Semana_4) {
      semana = 4
    } else if (dia >= InicioSemana.Semana_3) {
      semana = 3
    } else if (dia >= InicioSemana.Semana_2) {
      semana = 2
    }
    return semana
  }

  const cambiarValor = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let { value, name, type } = e.target

    let valor: string | Date = value
    if (type == "date") {
      valor = new Date(value+"T12:00")
    }

    setActividad({
      ...Actividad,
      [name]: valor
    })
  }
    console.log(Errores);
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 opacity-100 backdrop-blur-sm}`}
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
    >
      <div className={`w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 scale-100`}>
        <div className="text-2xl font-bold text-blue-900">
          Registrar nueva activadad
        </div>

        <br />
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              name="Nombre"
              className={`mt-1 block w-full rounded-md bg-gray-50 p-2 shadow-sm focus:border-blue-500
               focus:ring-blue-500 sm:text-sm  ${Errores.Nombre ? "!border-red-500" : "border-gray-300"}`}
              value={Actividad.Nombre}
              onChange={cambiarValor}
            />
          </div>
          <div className="w-full">
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
              Fecha de inicio
            </label>
            <input
              type="date"
              name="FechaInicio"
              className={`mt-1 block w-full rounded-md bg-gray-50 p-2 shadow-sm focus:border-blue-500
               focus:ring-blue-500 sm:text-sm  ${Errores.FechaInicio ? "!border-red-500" : "border-gray-300"}`}
              value={new Date(Actividad.FechaInicio).toISOString().slice(0, 10)}
              onChange={cambiarValor}
            />
            {
              Errores.FechaInicio &&
              <label className="block text-sm font-sm text-red-400"> La fecha de inicio debe de ser en el mes actual </label>
            }
          </div>
          <div className="w-full">
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
              Fecha de vencimiento
            </label>
            <input
              type="date"
              name="FechaVencimiento"
              className={`mt-1 block w-full rounded-md bg-gray-50 p-2 shadow-sm focus:border-blue-500
               focus:ring-blue-500 sm:text-sm  ${Errores.FechaVencimiento ? "!border-red-500" : "border-gray-300"}`}
              value={new Date(Actividad.FechaVencimiento).toISOString().slice(0, 10)}
              onChange={cambiarValor}
            />
          </div>
        </div>
        <br />
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={() => Cerrar("")} className="rounded-md bg-red-300 px-4 py-2 text-gray-800 transition-colors hover:bg-red-400">
            Cancelar
          </button>
          <button onClick={Guardar} className="rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
            Guardar
          </button>
        </div>
      </div>
      <Cargando isLoading={isLoading} />
      <MensajeNotificacion {...notification} hideNotification={hideNotification} />
    </div>
  );
}