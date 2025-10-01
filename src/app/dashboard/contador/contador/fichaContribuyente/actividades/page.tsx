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
import ModalAgregarActividad from './ModalAgregarActividad';
import ModalIncidencias from './ModalIncidencias';
import { EstatusActividad, EstatusValidacion } from '@/src/Interfaces/enums';
import { ActividadesFijas } from '@/src/app/dashboard/administracion/actividades/page';

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
  console.log(idContribuyente);
  
  // Inicializa el router para la navegación
  const router = useRouter();
  const sesion = ObtenerSesionUsuario();
  const { notification, showNotification, hideNotification } = useNotification();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [Fecha,setFecha]=useState<Date>(new Date())
  const [Servicios,setServicios]=useState<SelectServicio[]>([])
  const [idServicio, setIdServicios] = useState<string>("")
  const [ListaActividades,setListaActividades]=useState<ActividadPeriodica[]>([])

  const [showAgregar, setShowAgregar] = useState<boolean>(false);
  const [idActividad, setIdActividad] = useState<string>("")

  const [showIncidenciasModal, setShowIncidenciasModal] = useState(false);
  const [selectedActividadId, setSelectedActividadId] = useState<string>('');
  const [selectedActividadNombre, setSelectedActividadNombre] = useState<string>('');


  useEffect(() => {
    iniciar()
  }, []);
  const iniciar = async () => {
    await listarServicios()
  }
  useEffect(() => {
    BuscarActividades()
    setIdActividad("")
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
    setIdActividad("")
    // if(!idServicio)return

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
  const ActualizarEstadoActividad = async (_id: string,EstadoActividad: EstatusActividad) => {
    setListaActividades([])

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/actividadesperiodicas/ActualizarEstado`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id,
          EstadoActividad,
          idUsuarioRegistro: sesion.idUsuario
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'La respuesta de la API de servicios no es un array válido.');
      }else{
        showNotification(data.mensaje, 'success');
        BuscarActividades();
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
  const esMesActual = (fecha: Date) => {
    const hoy = new Date();
    return fecha.getFullYear() === hoy.getFullYear() &&
      fecha.getMonth() === hoy.getMonth(); // getMonth() devuelve de 0 (enero) a 11 (diciembre)
  }

  const CerrarAgregar = (existo: string) => {
    setShowAgregar(false);
    if (existo === "success") {
      showNotification("Actividad registrada correctamente", "success");
    }
    BuscarActividades()
  };
  const CambiarSelectEstatoActividad = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    let estatus = parseInt(value) as EstatusActividad
    ActualizarEstadoActividad(idActividad, estatus)
  };

  const openIncidenciasModal = (id: string, nombre: string) => {
    setSelectedActividadId(id);
    setSelectedActividadNombre(nombre);
    setShowIncidenciasModal(true);
  };

  // Función para cerrar el modal
  const closeIncidenciasModal = () => {
    setShowIncidenciasModal(false);
    setSelectedActividadId('');
    setSelectedActividadNombre('');
  };

   const handleIncidenciaGuardada = () => {
      // Este método se ejecuta cuando se ha guardado una incidencia con éxito en el modal.
      console.log(`Incidencia guardada para ${selectedActividadId}. Actualizando la vista del padre...`);
      // Aquí se podría actualizar el conteo de incidencias o forzar una recarga de la lista de actividades.
  }


  return (
    <div className="p-10 flex-1 overflow-auto">
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extrabold text-blue-900">Actividades</h2>

          <div className="flex space-x-4">
            <button
              onClick={() =>  Cerrar(``)}
              className="rounded-lg bg-gray-300 px-6 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-400">
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
            
            <div className="w-full sm:w-1/3">
              {
                esMesActual(Fecha) &&
                <button className="float-right rounded-lg text-white bg-blue-600 px-6 py-2 text-sm font-medium transition-colors duration-200 hover:bg-blue-700"
                  onClick={() => setShowAgregar(true)}  >
                  Nueva actividad </button>
              }
            </div>
          </div>
        </div>
        
        <div className="rounded-xl bg-white p-6 shadow-md">
          <table className='w-full'>
            <thead>
              <tr className="bg-gray-200 text-left text-gray-700 ">
                <th className=" px-4 py-2">Actividad</th>
                <th className=" px-4 py-2 text-center">Fecha de Inicio</th>
                <th className=" px-4 py-2 text-center">Fecha de vencimiento</th>
                <th className=" px-4 py-2 text-center">Origen</th>
                <th className=" px-4 py-2 text-center">Estado</th>
                <th className=" px-4 py-2 text-end">Incidencias</th>
              </tr>
            </thead>
            <tbody>
              {
                ListaActividades.map((actividad,key) =>
                  <tr key={key} className=" text-left">
                    <td className=" px-4 py-2">{actividad.Nombre}</td>
                    <td className=" px-4 py-2 text-center">{new Date(actividad.FechaInicio).toLocaleDateString()}</td>
                    <td className=" px-4 py-2 text-center">{new Date(actividad.FechaVencimiento).toLocaleDateString()}</td>
                    <td className=" px-4 py-2 text-center">{actividad.TipoOrigen}</td>
                    {
                      idActividad == actividad._id ?
                        <td className=" px-4 py-2 text-end">
                          <select
                            id="EstadoActividad"
                            value={actividad.EstadoActividad || 0}
                            onChange={CambiarSelectEstatoActividad}
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          >
                            {Object.values(EstatusActividad).filter((value) => typeof value === "number").map((value) => (
                              <option key={value} value={value}>
                                {EstatusActividad[value as EstatusActividad].replace(/_/g," ")}
                              </option>
                            ))}
                          </select>
                        </td>
                        :
                        <td className=" px-4 py-2 text-center" onDoubleClick={() => setIdActividad(actividad._id || "")}>{EstatusActividad[actividad.EstadoActividad || 0].replace(/_/g," ")}</td>
                    }
                    {/* Columna de Incidencias con Botón (Implementación de la solicitud del usuario) */}
                  <td className="px-4 py-3 text-center">
                    <button
                        onClick={() => openIncidenciasModal(actividad._id || "", actividad.Nombre)}
                        className="text-red-600 hover:text-red-800 font-semibold transition-colors flex items-center justify-center p-2 rounded-full bg-red-100 mx-auto shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        title="Registrar o ver incidencias"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            {/* Icono de Alerta */}
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.332 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    </button>
                  </td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
         {/* Renderizar el Modal de Incidencias si está visible */}
      {showIncidenciasModal && (
          <ModalIncidencias 
              idActividad={selectedActividadId}
              actividadNombre={selectedActividadNombre}
              idContribuyente={idContribuyente}
              onClose={closeIncidenciasModal} 
              onIncidenciaGuardada={handleIncidenciaGuardada}
          />
      )}
        <ModalAgregarActividad idContribuyente={idContribuyente||""} Cerrar={CerrarAgregar} Visible={showAgregar} />
        <Cargando isLoading={isLoading} />
        <MensajeNotificacion {...notification} hideNotification={hideNotification} />
      </div>
    </div>
  );
};

