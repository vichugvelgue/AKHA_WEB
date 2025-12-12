// app/dashboard/administracion/usuarios/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importa el hook useRouter
import ToggleSwitch from "@/src/hooks/ToggleSwitch";
import Cargando from '@/src/hooks/Cargando';
import { useNotification } from '@/src/hooks/useNotifications';
import { CalculoFiscal, Cliente, HistorialSaldo, Impuesto } from '@/src/Interfaces/Interfaces';
import { convertirPesos, ObtenerSesionUsuario } from '@/src/utils/constantes';
import ModalBitacoraContibuyente from '@/src/hooks/ModalBitacoraContibuyente';
import MensajeNotificacion from '@/src/hooks/MensajeNotificacion';
import RegistrarUsoSaldo from './registrarUsoSaldo';
import Seperador from '@/src/hooks/Separador';
import ModalPregunta from '@/src/hooks/ModalPregunta';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';


// Definimos una interfaz para las propiedades del modal de registro
interface historicoSaldoFavorProps {
  idContribuyente?: string;
  Cerrar: (exito: string) => void;
}

// Componente para la vista de CRUD de Usuarios
export default function HitoricoSaldoFavor({ idContribuyente, Cerrar }: historicoSaldoFavorProps) {
  // Inicializa el router para la navegación
  const router = useRouter();
  const sesion = ObtenerSesionUsuario();
  const { notification, showNotification, hideNotification } = useNotification();

  const [idEditar, setIdEditar] = useState<string>("");
  const [idImpuesto, setIdImpuesto] = useState<string>("");
  const [ListaImpuestos, setListaImpuestos] = useState<Impuesto[]>([]);
  const [ListaMovimientos, setListaMovimientos] = useState<HistorialSaldo[]>([]);
  const [Calculo, setCalculo] = useState<CalculoFiscal | null>();
  const [isLoading, setloading] = useState<boolean>(false);
  const [Fecha, setFecha] = useState<Date>(new Date())

  const [showAgregar, setShowAgregar] = useState<boolean>(false);
  const [showPreguntaEliminar, setPreguntaEliminar] = useState<boolean>(false);

  const [Acumulado, setAcumulado] = useState<number>(0);
  const [Utilizado, setUtilizado] = useState<number>(0);
  const [Dispobible, setDispobible] = useState<number>(0);

  const [UtilizadoImpuesto, setUtilizadoImpuesto] = useState<number>(0);
  const [TotalImpuesto, setTotalImpuesto] = useState<number>(0);


  useEffect(() => {
    Iniciar()
  }, []);
  const Iniciar = async () => {
    await ObtenerTotales()
    await ObtenerImpuestos()
    await BuscarCalculoPorMes()
  }
  useEffect(() => {
    BuscarCalculoPorMes()
  }, [Fecha]);
  useEffect(() => {
    BuscarPorCalculoYImpuesto()
  }, [Calculo, idImpuesto]);
  const BuscarPorCalculoYImpuesto = async () => {
    setListaMovimientos([])
    if (Calculo) {
      await BuscarMovimientosPorCalculo(Calculo)
    }
  }

  const ObtenerTotales = async () => {
    setloading(true);
    try {
      const respuesta = await fetch(`${API_BASE_URL}/historialsaldos/ObtenerPorTotales/${idContribuyente}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await respuesta.json();
      console.log(data);

      if (respuesta.ok) {
        setDispobible(data.data.Disponible)
        setUtilizado(data.data.Utilizado)
        setAcumulado(data.data.Acumulado)
      } else {
        showNotification(data.mensaje, "error")
      }
      setloading(false);
    } catch {
      setloading(false);
      showNotification("Ocurrio un error, intentelo mas tarde", "error")
    }
  }
  const ObtenerImpuestos = async () => {
    setloading(true);
    try {
      const respuesta = await fetch(`${API_BASE_URL}/impuestos/ObtenerPorCliente/${idContribuyente}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await respuesta.json();

      if (respuesta.ok) {
        setListaImpuestos(data.data)
      } else {
        showNotification(data.mensaje, "error")
      }
      setloading(false);
    } catch {
      setloading(false);
      showNotification("Ocurrio un error, intentelo mas tarde", "error")
    }
  }
  const BuscarCalculoPorMes = async () => {
    setloading(true);
    setListaMovimientos([])
    setCalculo(null)
    try {
      const respuesta = await fetch(`${API_BASE_URL}/calculosFiscales/BuscarPorMesCliente`, {
      })
      const data = await respuesta.json();

      if (respuesta.ok) {
          setCalculo(data.data)
      } else {
        showNotification(data.mensaje, "error")
      }
      setloading(false);
    } catch {
      setloading(false);
      showNotification("Ocurrio un error, intentelo mas tarde", "error")
    }
  }
  const BuscarMovimientosPorCalculo = async (Calculo: CalculoFiscal) => {
    setloading(true);
    setListaMovimientos([])
    if (!idImpuesto || !Calculo) return
    try {
      const respuesta = await fetch(`${API_BASE_URL}/historialsaldos/ObtenerPorCalculo/${Calculo._id}/${idImpuesto}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await respuesta.json();

      if (respuesta.ok) {
        if (data.data) {
          setListaMovimientos(data.data)
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
  const Cancelar = async (id: string) => {
    setloading(true);
    setListaMovimientos([])
    try {
      const respuesta = await fetch(`${API_BASE_URL}/historialsaldos/Cancelar/${id}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await respuesta.json();

      if (respuesta.ok) {
        showNotification(data.mensaje, "success")
      } else {
        showNotification(data.mensaje, "error")
      }
      setloading(false);
    } catch {
      setloading(false);
      showNotification("Ocurrio un error, intentelo mas tarde", "error")
    }
  }
  const ObtenerSaldosImpuesto = () => {
    if (!Calculo || !idImpuesto) {
      setUtilizadoImpuesto(0)
      setTotalImpuesto(0)
      return
    }

    let impuesto = Calculo.Impuestos?.find((impuesto) => impuesto.idImpuesto == idImpuesto)
    if (!impuesto) {
      setUtilizadoImpuesto(0)
      setTotalImpuesto(0)
    } else {
      setUtilizadoImpuesto(impuesto.Utilizado || 0)
      setTotalImpuesto(impuesto.Monto || 0)
    }
  }
  const FormatearFecha = (fecha: Date) => {
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(fecha))
  }
  const CerrarAgregar = (exito: string) => {
    setShowAgregar(false)
    if (exito == "success") {
      showNotification("El historial se registro correctamente", "success")
      BuscarCalculoPorMes()
    }
  }
  const PreguntarEliminar = (id: string) => {
    setIdEditar(id)
    setPreguntaEliminar(true)
  }
  const CerrarPreguntarEliminar = (exito: boolean) => {
    setPreguntaEliminar(false)
    if (exito) {
      Cancelar(idEditar)
    }
  }

  return (
    <div className="space-y-6 p-4  overflow-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-blue-900">Historial de saldos a favor</h2>
        <div className="flex space-x-4">
          <button className="rounded-lg bg-gray-300 px-6 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-400"
            onClick={() => Cerrar('')} > Regresar </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="rounded-xl bg-yellow-100 p-6 shadow-md w-full">
          <h2><b>Acumulado</b></h2>
          <h2>{convertirPesos(Acumulado)}</h2>
        </div>
        <div className="rounded-xl bg-yellow-100 p-6 shadow-md w-full">
          <h2><b>Utilizado</b></h2>
          <h2>{convertirPesos(Utilizado)}</h2>
        </div>
        <div className="rounded-xl bg-green-100 p-6 shadow-md w-full">
          <h2><b>Disponible</b></h2>
          <h2>{convertirPesos(Dispobible)}</h2>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-full sm:w-3/3 md:w-1/3">
            <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">
              Filtrar por mes y año
            </label>
            <input
              type="month"
              id="NombreBuscar"
              value={Fecha.toLocaleString('fr-CA', { month: '2-digit', year: 'numeric' })}
              onChange={(e) => setFecha(new Date(e.target.value + "-01T12:00:00"))}
              placeholder="Mes y año a buscar"
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="w-full sm:w-3/3 md:w-1/3">
            <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">
              Impuesto
            </label>
            <select
              onChange={(e) => setIdImpuesto(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={idImpuesto}>
              <option value="">Seleccione un impuesto</option>
              {
                ListaImpuestos.map((impuesto) => (
                  <option key={impuesto._id} value={impuesto._id}>{impuesto.Nombre}</option>
                ))
              }
            </select>
          </div>
          {
            Calculo?._id && idImpuesto &&
            <div className="w-full sm:w-3/3 md:w-1/3">
              <button className="float-right rounded-lg text-white bg-blue-600 px-6 py-2 text-sm font-medium transition-colors duration-200 hover:bg-blue-700"
                onClick={() => setShowAgregar(true)}              >
                Registrar
              </button>
            </div>
          }
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white p-6 shadow-md">
        <Seperador Titulo='Saldo a favor usados por movimiento' />

        <div className="flex items-center justify-between gap-4 pb-6">
          <div className="rounded-xl bg-yellow-100 p-6 shadow-md w-full">
            <h2><b>Total saldo por impuesto:</b> {convertirPesos(TotalImpuesto)}</h2>
          </div>
          <div className="rounded-xl bg-yellow-100 p-6 shadow-md w-full">
            <h2><b>Utilizado por impuesto:</b> {convertirPesos(UtilizadoImpuesto)}</h2>
          </div>
        </div>

        <table className="min-w-full table-auto ">
          <thead>
            <tr className="bg-gray-200 text-left text-gray-700 ">
              <th style={{ width: "150px" }} className="px-4 py-2">Fecha</th>
              <th style={{ width: "auto" }} className="px-4 py-2">Monto</th>
              <th className=" px-4 py-2 text-center">Observaciones</th>
              <th className=" px-4 py-2 text-end">Acciones</th>
            </tr>
          </thead>w
          <tbody>
            {ListaMovimientos.map(movimiento => (
              <tr key={movimiento._id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2">{FormatearFecha(movimiento.Fecha || new Date(2000, 1, 1))}</td>
                <td className="px-4 py-2">{convertirPesos(movimiento.Monto || 0)}</td>
                <td className="px-4 py-2 text-justify">
                  {movimiento.Observaciones}
                </td>
                <td className="px-4 py-2 flex text-justify justify-end space-x-2 ">
                  <button onClick={() => PreguntarEliminar(movimiento._id || "")} className="rounded-md bg-red-600 px-4 py-1 text-sm text-white transition-colors duration-200 hover:bg-red-700">
                    <i className="material-symbols-rounded filled">delete</i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showPreguntaEliminar && <ModalPregunta Pregunta="¿Desea eliminar este movimiento?" Cerrar={CerrarPreguntarEliminar} />}
      <RegistrarUsoSaldo Visible={showAgregar} idContribuyente={idContribuyente || ""} idImpuesto={idImpuesto} Cerrar={CerrarAgregar} idCalculo={Calculo?._id || ""} />
      <Cargando isLoading={isLoading} />
      <MensajeNotificacion {...notification} hideNotification={hideNotification} />
    </div>
  );
};
