// app/dashboard/administracion/usuarios/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importa el hook useRouter
import ToggleSwitch from "@/src/hooks/ToggleSwitch";
import Cargando from '@/src/hooks/Cargando';
import { useNotification } from '@/src/hooks/useNotifications';
import { Modulo, Permiso, TipoUsuario, Cliente, ActividadPeriodica } from '@/src/Interfaces/Interfaces';
import { ObtenerSesionUsuario } from '@/src/utils/constantes';
import ModalBitacoraContibuyente from '@/src/hooks/ModalBitacoraContibuyente';
import MensajeNotificacion from '@/src/hooks/MensajeNotificacion';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

interface SelectServicio {
  _id: string;
  Nombre: string;
}

// Definimos una interfaz para las propiedades del modal de registro
interface ModalProps {
  idContribuyente?: string;
  Cerrar: (Mensaje: string) => void;
}

// Componente para la vista de CRUD de Usuarios
export default function ActividadesCRUD({ idContribuyente, Cerrar }: ModalProps) {
  // Inicializa el router para la navegación
  const router = useRouter();
  const sesion = ObtenerSesionUsuario();
  const { notification, showNotification, hideNotification } = useNotification();

  const [tiposUsuarios, setTiposUsuarios] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [Fecha,setFecha]=useState<Date>(new Date())
  const [Servicios,setServicios]=useState<SelectServicio[]>([])
  const [idServicio, setIdServicios] = useState<string>("")
  const [ListaActividades,setListaActividades]=useState<ActividadPeriodica[]>([])


  useEffect(() => {
    iniciar()
  }, []);
  const iniciar = async () => {
    await listarServicios()
  }
  useEffect(() => {
    BuscarActividades()
  }, [Fecha,idServicio]);

  const listarServicios = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/Servicios/ObtenerListadoPorCliente/${idContribuyente}`);
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'La respuesta de la API de servicios no es un array válido.');
      }
      console.log('servicios:', result.data);
      if (result.data) {
        setServicios(result.data as SelectServicio[])
      }
    } catch (err: any) {
      console.error('Error al cargar los servicios:', err);
      showNotification('Error al cargar los servicios.', 'error');
    } finally {
      setIsLoading(false)
    }
  };
  const BuscarActividades = async () => {
    setListaActividades([])
    if(!idServicio)return

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/actividadesperiodicas/BuscarPorMesServicio`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FechaInicio:Fecha,
          idServicio:idServicio,
          idCliente:idContribuyente,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'La respuesta de la API de servicios no es un array válido.');
      }
      console.log('servicios:', data.data);
      if (data.data) {
        setListaActividades(data.data)
      }
    } catch (err: any) {
      console.error('Error al cargar los servicios:', err);
      showNotification('Error al cargar los servicios.', 'error');
    } finally {
      setIsLoading(false)
    }
  };
  const CambiarFecha = async (e:React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    let valor = new Date(value+"-02")
    setFecha(valor)
  } 

  return (
    <div className="p-10 flex-1 overflow-auto">
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extrabold text-blue-900">Actividades</h2>

          <div className="flex space-x-4">
            <button
              onClick={() => Cerrar("")}
              className="rounded-lg bg-gray-300 px-6 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-400"
            >
              Regresar
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-full sm:w-1/3">
              <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">
                Mes y año 
              </label>
              <input
                type="month"
                id="NombreBuscar"
                value={Fecha.toLocaleString('fr-CA', { month: '2-digit', year: 'numeric' })}
                onChange={CambiarFecha}
                placeholder="Buscar por nombre..."
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div className="w-full sm:w-1/3">
              <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">
                Servicio
              </label>
              <select
                value={idServicio || ''}
                onChange={(e) => setIdServicios(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value={""}>Seleccione</option>
                {
                  Servicios.map((item) => (
                    <option key={item._id} value={item._id}>{item.Nombre}</option>
                  ))
                }
              </select>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl bg-white p-6 shadow-md">
          <table className='w-full'>
            <thead>
              <tr className="bg-gray-200 text-left text-gray-700 ">
                <th className=" px-4 py-2">Actividad</th>
                <th className=" px-4 py-2 ">Fecha de Inicio</th>
                <th className=" px-4 py-2 ">Fecha de vencimiento</th>
                <th className=" px-4 py-2">Origen</th>
                <th className=" px-4 py-2 text-end">Estado</th>
                <th className=" px-4 py-2 text-end">Incidencias</th>
              </tr>
            </thead>
            <tbody>
              {
                ListaActividades.map(actividad =>
                  <tr className=" text-left">
                    <td className=" px-4 py-2">{actividad.Nombre}</td>
                    <td className=" px-4 py-2 text-center">{new Date(actividad.FechaInicio).toLocaleDateString()}</td>
                    <td className=" px-4 py-2 text-center">{new Date(actividad.FechaVencimiento).toLocaleDateString()}</td>
                    <td className=" px-4 py-2 text-center">{actividad.TipoOrigen}</td>
                    <td className=" px-4 py-2 text-center">{actividad.EstadoActividad}</td>
                    <td className=" px-4 py-2 text-center">{actividad.idIncidencia}</td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>

        <Cargando isLoading={isLoading} />
        <MensajeNotificacion {...notification} hideNotification={hideNotification} />
      </div>
    </div>
  );
};

