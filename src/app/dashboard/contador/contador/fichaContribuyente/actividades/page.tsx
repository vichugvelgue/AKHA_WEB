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
import CalculosFiscales from '../calculosFiscales/calculosFiscales';
import ResumenesEjecutivos from '../resumenEjecutivo/resumenesjecutivos';
import RegistroPagos from '../registroPagos/registropagos';
import RegistroArchivoGeneral from '../archivoGeneral/registroarchivogeneral';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

interface SelectServicio {
  _id: string;
  Nombre: string;
}

// Definimos una interfaz para las propiedades del modal de registro
interface ModalProps {
  idContribuyente?: string;
  NombreContribuyente?: string;
  Cerrar: (Mensaje: string) => void;
}

// Componente para la vista de CRUD de Usuarios
export default function ActividadesCRUD({ idContribuyente,NombreContribuyente, Cerrar }: ModalProps) {
  // Inicializa el router para la navegación
  const router = useRouter();
  const sesion = ObtenerSesionUsuario();  
  const { notification, showNotification, hideNotification } = useNotification();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [Fecha,setFecha]=useState<Date>(new Date())
  const [Servicios,setServicios]=useState<SelectServicio[]>([])
  const [idServicio, setIdServicios] = useState<string>("")
  const [ListaActividades,setListaActividades]=useState<ActividadPeriodica[]>([])

  const [idActividad, setIdActividad] = useState<string>("")
  
  const [showAgregar, setShowAgregar] = useState<boolean>(false);
  const [OpenCalculosFiscales, setOpenCalculosFiscales] = useState(false);
  const [OpenResumenEjecutivo, setOpenResumenEjecutivo] = useState(false);
  const [OpenRegistroPagos, setOpenRegistroPagos] = useState(false);
  const [OpenComprobantesActividades, setOpenComprobantesActividades] = useState(false);

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

  const CerrarCalculosFiscales = (exist: string) => {
    setOpenCalculosFiscales(false);
    if (exist === "success") {
      showNotification("Calculos fiscales guardados correctamente", "success");
    }
  };
  const CerrarResumenEjectutivo = (exist: string) => {
    setOpenResumenEjecutivo(false);
    if (exist === "success") {
      showNotification("Resumen ejectutivo guardado correctamente", "success");
    }
  };
  const CerrarRegistroPagos = (exist: string) => {
    setOpenRegistroPagos(false);
    if (exist === "success") {
      showNotification("Registro de pagos guardado correctamente", "success");
    }
  };
  const CerrarRegistroComprobanteActividades = (exist: string) => {
    setOpenComprobantesActividades(false);
    if (exist === "success") {
      showNotification("Registro de comprobante guardado correctamente", "success");
    }
  };
  const BotonActividad = (idActividad: string, Nombre: string) => {
    let esFija = ActividadesFijas.includes(idActividad);
    let onclic = () => {};
    let icon = null;
    
    
        switch (idActividad) {
            case "68daafc6209ee6ddd4d946e7": // Calculo fiscal
                onclic = () => { 
                  setIdActividad(idActividad);
                  setOpenCalculosFiscales(true); 
                };
                icon = <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l2-2l2 2v13M9 19a3 3 0 006 0M9 19a3 3 0 01-6 0m6 0a3 3 0 000-6m-6 6a3 3 0 010-6m6 0a3 3 0 01-6 0m6 0a3 3 0 006 0m-6 0a3 3 0 010 6m6 0a3 3 0 000-6"></path></svg>; // Icono de Calculadora
                break;
            case "68daafd5209ee6ddd4d946eb": // Resumen ejecutivo
                onclic = () => { 
                  setIdActividad(idActividad);
                  setOpenResumenEjecutivo(true);
                 };
                icon = <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l2-2l2 2v13M9 19a3 3 0 006 0m-6 0a3 3 0 01-6 0m6 0a3 3 0 000-6m-6 6a3 3 0 010-6m6 0a3 3 0 01-6 0m6 0a3 3 0 006 0m-6 0a3 3 0 010 6m6 0a3 3 0 000-6"></path></svg>; // Icono de Gráfico
                break;
            case "68dab10c197a935fb6bb92e1": // Registro de pagos
            onclic = () => { 
              setIdActividad(idActividad);
              setOpenRegistroPagos(true); 
            };
                icon = <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l2-2l2 2v13M9 19a3 3 0 006 0m-6 0a3 3 0 01-6 0m6 0a3 3 0 000-6m-6 6a3 3 0 010-6m6 0a3 3 0 01-6 0m6 0a3 3 0 006 0m-6 0a3 3 0 010 6m6 0a3 3 0 000-6"></path></svg>; // Icono de Gráfico
                break;
            case "68dab4fa78038f650675da8f": // Recepción de documentos
            default:                          
              onclic = () => { 
                setIdActividad(idActividad);
                setOpenComprobantesActividades(true);
               };
                icon = <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-3-6v6m3 6H6a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v11a2 2 0 01-2 2z"></path></svg>; // Icono de Documento
                break;
        }
    


      return (
        <button
          onClick={onclic}
          title={Nombre}
          className={`
            flex items-center text-left py-1 px-2 rounded-lg transition-all duration-300 
            ${esFija 
              ? "bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 hover:shadow-md" 
              : "bg-gray-200 text-gray-800"
            }
          `}>
          {icon}
          {Nombre}
        </button>
      )
  }
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
      // console.log(`Incidencia guardada para ${selectedActividadId}. Actualizando la vista del padre...`);
      // Aquí se podría actualizar el conteo de incidencias o forzar una recarga de la lista de actividades.
  }

  const getStatusClasses = (status: EstatusActividad) => {
    switch (status) {
        case EstatusActividad.Pendiente:
            return 'bg-yellow-100 text-yellow-800';
        case EstatusActividad.En_proceso:
            return 'bg-blue-100 text-blue-800';
        case EstatusActividad.Terminado:
            return 'bg-green-100 text-green-800';
        case EstatusActividad.Detenido:
            return 'bg-purple-100 text-purple-800';
        case EstatusActividad.Con_incidencia:
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

  return (
        <div className="p-4 sm:p-8 flex-1 overflow-auto bg-gray-50 font-sans">
           <style>{`
            .font-sans { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif; }
            /* Estilo para las filas pares de la tabla */
            .table-striped tbody tr:nth-child(even) {
                background-color: #f9fafb; /* gray-50 */
            }
        `}</style>
        
            
          {/* --- ENCABEZADO MEJORADO CON INFORMACIÓN DEL CONTRIBUYENTE --- */}
        <div className="bg-white shadow-xl rounded-xl p-6 mb-6 border-l-4 border-indigo-600">
            <div className="flex items-center justify-between flex-wrap">
                <div>
                    <h1 className="text-xl font-medium text-gray-500 mb-1">Actividades de Contribuyente</h1>
                    <h2 className="text-3xl font-extrabold text-indigo-900 truncate max-w-lg">
                        {NombreContribuyente}
                    </h2>
                </div>
                <button
                    onClick={() => Cerrar(``)}
                    className="mt-4 sm:mt-0 rounded-lg bg-gray-200 px-6 py-2 text-gray-800 font-medium transition-colors duration-200 hover:bg-gray-300 flex items-center shadow-sm hover:shadow-md"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path></svg>
                    Regresar a Clientes
                </button>
            </div>
        </div>

          {/* --- FILTROS DE ACTIVIDADES --- */}
        <div className="rounded-xl bg-white p-6 shadow-md mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
                {/* Filtro Mes y Año */}
                <div className="col-span-1">
                    <label htmlFor="fechaFilter" className="block text-sm font-medium text-gray-700 mb-1">
                        Mes y Año de Actividad
                    </label>
                    <input
                        type="month"
                        id="fechaFilter"
                        value={Fecha.toLocaleString('fr-CA', { month: '2-digit', year: 'numeric' })}
                        onChange={CambiarFecha}
                        className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                {/* Filtro Servicio */}
                <div className="col-span-1">
                    <label htmlFor="servicioFilter" className="block text-sm font-medium text-gray-700 mb-1">
                        Servicio Asignado
                    </label>
                    <select
                        id="servicioFilter"
                        value={idServicio || ''}
                        onChange={(e) => setIdServicios(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value={""}>Todos los Servicios</option>
                        {Servicios.map((item) => (
                            <option key={item._id} value={item._id}>{item.Nombre}</option>
                        ))}
                    </select>
                </div>

                {/* Botón Nueva Actividad */}
                <div className="col-span-1 flex justify-end">
                    {esMesActual(Fecha) && (
                        <button 
                            className="w-full sm:w-auto rounded-lg text-white bg-indigo-600 px-6 py-2.5 text-sm font-semibold transition-colors duration-200 hover:bg-indigo-700 shadow-lg hover:shadow-xl"
                            onClick={() => setShowAgregar(true)}
                        >
                            <span className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                Nueva Actividad
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </div>
        
        <div className="rounded-xl bg-white p-6 shadow-2xl overflow-x-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Listado de Tareas del Periodo</h3>
            <table className='min-w-full divide-y divide-gray-200 table-striped'>
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tl-lg">Actividad / Tarea</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Semana</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha Inicio</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Vencimiento</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Origen</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tr-lg">Incidencias</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {ListaActividades.map((actividad, key) =>
                        <tr key={key} className="hover:bg-indigo-50 transition duration-150">
                            {/* Actividad con Botón Resaltado */}
                            <td className="px-4 py-3 font-medium text-sm text-gray-900">
                                {BotonActividad(actividad.idActividad || "", actividad.Nombre)}
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-gray-600">{actividad.SemanaOperativa}</td>
                            <td className="px-4 py-3 text-center text-sm text-gray-600">{new Date(actividad.FechaInicio).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-center text-sm font-semibold text-red-600">{new Date(actividad.FechaVencimiento).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-center text-xs">
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-200 text-gray-800">
                                    {actividad.TipoOrigen}
                                </span>
                            </td>
                            {/* Columna de Estado con Badge y Doble Click para Editar */}
                            {idActividad === actividad._id ?
                                <td className="px-4 py-3 text-center w-40">
                                    <select
                                        id="EstadoActividad"
                                        value={actividad.EstadoActividad || 0}
                                        onChange={CambiarSelectEstatoActividad}
                                        className="block w-full rounded-md border-gray-300 bg-white p-1.5 shadow-sm text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        {Object.values(EstatusActividad).filter((value) => typeof value === "number").map((value) => (
                                            <option key={value} value={value}>
                                                {EstatusActividad[value as EstatusActividad].replace(/_/g, " ")}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                :
                                <td className="px-4 py-3 text-center text-xs w-40" onDoubleClick={() => setIdActividad(actividad._id || "")}>
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full cursor-pointer transition-colors ${getStatusClasses(actividad.EstadoActividad || 0)}`}
                                          title="Doble click para editar">
                                        {EstatusActividad[actividad.EstadoActividad || 0].replace(/_/g, " ")}
                                    </span>
                                </td>
                            }
                            {/* Columna de Incidencias con Botón Resaltado (Acción Principal) */}
                            <td className="px-4 py-3 text-center">
                                <button
                                    onClick={() => openIncidenciasModal(actividad._id || "", actividad.Nombre)}
                                    className="bg-red-500 text-white hover:bg-red-700 font-semibold transition-all flex items-center justify-center p-2 rounded-full mx-auto shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300"
                                    title="Registrar o ver incidencias"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.332 16c-.77 1.333.192 3 1.732 3z"></path>
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        {OpenCalculosFiscales && <CalculosFiscales Visible={OpenCalculosFiscales} idEditar={idContribuyente||""} Cerrar={CerrarCalculosFiscales} />}
        {OpenResumenEjecutivo && <ResumenesEjecutivos Visible={OpenResumenEjecutivo} idEditar={idContribuyente || ""} Cerrar={CerrarResumenEjectutivo} />}
        {OpenRegistroPagos && <RegistroPagos Visible={OpenRegistroPagos} idEditar={idContribuyente || ""} Cerrar={CerrarRegistroPagos} />}
        {OpenComprobantesActividades && <RegistroArchivoGeneral idActividad={idActividad} Visible={OpenComprobantesActividades} idEditar={idContribuyente || ""} Cerrar={CerrarRegistroComprobanteActividades} />}
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
  );
};

