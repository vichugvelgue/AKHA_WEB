// app/dashboard/administracion/usuarios/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importa el hook useRouter
import ToggleSwitch from "@/src/hooks/ToggleSwitch";
import Cargando from '@/src/hooks/Cargando';
import { useNotification } from '@/src/hooks/useNotifications';
import { Modulo, Permiso, TipoUsuario, Cliente } from '@/src/Interfaces/Interfaces';
import ContribuyentesAgregar from '@/src/app/dashboard/administracion/contribuyentes/Agregar';
import { ObtenerSesionUsuario } from '@/src/utils/constantes';
import ModalBitacoraContibuyente from '@/src/hooks/ModalBitacoraContibuyente';
import ContribuyenteConsultar from '../../contador/contador/Agregar';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';


// Definimos una interfaz para las propiedades del modal de registro
interface ModalProps {
  idEditar?: string;
  Editar: boolean;
  onClose: () => void;
  onRegister: (Mensaje: string, Color: "success" | "error" | "warning") => void;
}

// Componente para la vista de CRUD de Usuarios
const RazonesSocialesCRUD = () => {
  // Inicializa el router para la navegación
  const router = useRouter();
  const sesion = ObtenerSesionUsuario();
  const { notification, showNotification, hideNotification } = useNotification();

  const [tiposUsuarios, setTiposUsuarios] = useState<Cliente[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showBitacora, setShowBitacora] = useState(false);
  const [idEditar, setIdEditar] = useState<string>("");
  const [editar, setEditar] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pregunta, setPregunta] = useState<string>("");
  const [operacion, setOperacion] = useState<string>("");
  const [NombreBuscar, setNombreBuscar] = useState<string>("");
  const [RfcBuscar, setRfcBuscar] = useState<string>("");


  useEffect(() => {
    Listar();
  }, []);

  const Listar = async () => {
    setIsLoading(true);
    setTiposUsuarios([]);
    try {
      const response = await fetch(`${API_BASE_URL}/clientes/ListarClientes`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      // Se añade un manejo de errores más robusto al intentar parsear la respuesta
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setTiposUsuarios(data.data);
      } else {
        const text = await response.text();
        console.error('La respuesta de la API no es JSON:', text);
        throw new Error('La API no devolvió un formato JSON válido.');
      }
    } catch (err: any) {
      console.error('Error al obtener las actividades:', err);
      setError(err.message || 'Hubo un error al cargar las actividades. Verifica que la API esté corriendo y responda correctamente.');
    } finally {
      setIsLoading(false);
    }
  };
  const Buscar = async () => {
    setIsLoading(true);
    setTiposUsuarios([]);
    try {
      const response = await fetch(`${API_BASE_URL}/clientes/BuscarClientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          RazonSocial: NombreBuscar,
          RFC: RfcBuscar,
        } as Cliente),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      // Se añade un manejo de errores más robusto al intentar parsear la respuesta
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setTiposUsuarios(data.data);
      } else {
        const text = await response.text();
        console.error('La respuesta de la API no es JSON:', text);
        throw new Error('La API no devolvió un formato JSON válido.');
      }
    } catch (err: any) {
      console.error('Error al obtener las actividades:', err);
      setError(err.message || 'Hubo un error al cargar las actividades. Verifica que la API esté corriendo y responda correctamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string = "") => {
    setPregunta("¿Estás seguro de que quieres eliminar el contribuyente?");
    setOperacion("eliminar");
    setIdEditar(id);
    setShowConfirm(true);
  };
  const handleDesactivar = (id: string = "") => {
    setPregunta("¿Estás seguro de que quieres desactivar/activar el contribuyente?");
    setOperacion("desactivar");
    setIdEditar(id);
    setShowConfirm(true);
  };

  const cancelDelete = () => {
    setPregunta("");
    setOperacion("");
    setIdEditar("");
    setShowConfirm(false);
  }
  const confirm = () => {
    if (idEditar !== "") {
      if (operacion == "eliminar") {
        EliminarTipoUsuario(idEditar);
      } else if (operacion == "desactivar") {
        DesactivarTipoUsuario(idEditar);
      }
    }
    setIdEditar("");
    setShowConfirm(false);
  };

  const DesactivarTipoUsuario = async (id: string = "") => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/Clientes/DesactivarCliente/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ UsuarioAplico: sesion.idUsuario }),
      });
      setShowConfirm(false);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      showNotification(data.mensaje, "success");
      Listar();
    } catch (err: any) {
      showNotification(err.message || 'Hubo un error al desactivar/activar el contribuyente. Verifica que la API esté corriendo y responda correctamente.', "error");
    }
  };

  const EliminarTipoUsuario = async (id: string = "") => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/Clientes/EliminarCliente/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ UsuarioAplico: sesion.idUsuario }),
      });
      setShowConfirm(false);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      showNotification(data.mensaje, "success");
      Listar();
    } catch (err: any) {
      setShowConfirm(false);
      showNotification(err.message || 'Hubo un error al desactivar/activar el contribuyente. Verifica que la API esté corriendo y responda correctamente.', "error");
    }
  };

  // La función ahora recibe un objeto
  const handleRegister = (Mensaje: string, Color: "success" | "error" | "warning" = "success") => {
    showNotification(Mensaje, Color);
    setIsModalOpen(false);
    Listar();
  };

  // Función para abrir el modal
  const handleOpenModal = () => {
    setIdEditar("");
    setEditar(false);
    setIsModalOpen(true);
  };
  const handleEditModal = (id: string = "") => {
    setIdEditar(id);
    setEditar(true);
    setIsModalOpen(true);
  };
  const handleCloceModal = () => {
    setIsModalOpen(false);
    Listar();
  };
  const handleOpenModalBitacora = (id: string = "") => {
    setIdEditar(id);
    setShowBitacora(true);
  };
  const handleCloceModalBitacora = () => {
    setShowBitacora(false);
  };

  if (isModalOpen) {
    console.log({ idEditar, editar });
    return (<ContribuyentesAgregar idEditar={idEditar} Editar={editar} onClose={handleCloceModal} onRegister={handleRegister} />)
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-blue-900">Gestión de Contribuyentes</h2>

        <div className="flex space-x-4">
          <button
            onClick={() => {
              console.log("Regresando a /dashboard...");
              router.push('/dashboard');
            }}
            className="rounded-lg bg-gray-300 px-6 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-400"
          >
            Regresar
          </button>
          <button
            onClick={handleOpenModal}
            className="rounded-lg bg-yellow-400 px-6 py-2 text-gray-900 font-semibold transition-colors duration-200 hover:bg-yellow-500"
          >
            Nuevo Contribuyente
          </button>
        </div>
      </div>
      <div className="rounded-xl bg-white p-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-full sm:w-1/3">
            <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">
              Filtrar por Nombre
            </label>
            <input
              type="text"
              id="NombreBuscar"
              value={NombreBuscar}
              onChange={(e) => setNombreBuscar(e.target.value)}
              placeholder="Buscar por nombre..."
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="w-full sm:w-1/3">
            <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">
              Filtrar por RFC
            </label>
            <input
              type="text"
              id="RfcBuscar"
              value={RfcBuscar}
              onChange={(e) => setRfcBuscar(e.target.value)}
              placeholder="Buscar por RFC..."
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="w-full sm:w-1/3">
            <button
              onClick={Buscar}
              className="float-right rounded-lg text-white bg-blue-600 px-6 py-2 text-sm font-medium transition-colors duration-200 hover:bg-blue-700"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white p-6 shadow-md">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-left text-gray-700 ">
              <th className="px-4 py-2 ">Razón social</th>
              <th className="px-4 py-2 ">RFC</th>
              <th className=" px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tiposUsuarios.map(usuario => (
              <tr key={usuario._id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2">{usuario.RazonSocial}</td>
                <td className="px-4 py-2">{usuario.RFC}</td>
                <td className="px-4 py-2 flex justify-end space-x-2 ">
                  <button onClick={() => handleOpenModalBitacora(usuario._id || "")} className="rounded-md bg-blue-600 px-4 py-1 text-sm text-white transition-colors duration-200 hover:bg-blue-700">
                     <i className="material-symbols-rounded filled">visibility</i> 
                  </button>
                  <button onClick={() => handleEditModal(usuario._id || "")} className="rounded-md bg-blue-600 px-4 py-1 text-sm text-white transition-colors duration-200 hover:bg-blue-700">
                    <i className="material-symbols-rounded filled">stylus</i>
                  </button>
                  <button className={`rounded-md px-4 py-1 text-sm text-white transition-colors duration-200 ${usuario.Estado == 1 ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
                    onClick={() => handleDesactivar(usuario._id || "")} >
                    {usuario.Estado == 1 ? <i className="material-symbols-rounded">block</i> : <i className="material-symbols-rounded">check</i>}
                  </button>
                  <button className="rounded-md bg-red-600 px-4 py-1 text-sm text-white transition-colors duration-200 hover:bg-red-700"
                    onClick={() => handleDelete(usuario._id || "")} >
                    <i className="material-symbols-rounded filled">delete</i> 
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {
        showBitacora && 
        <ModalBitacoraContibuyente
          Cerrar={handleCloceModalBitacora}
          idContribuyente={idEditar}
        />
      }

      {/* Modal de confirmación de eliminación con animación */}
      {showConfirm && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 opacity-100 backdrop-blur-sm}`}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
        >
          <div className={`w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 scale-100`}>
            <p className="text-lg font-semibold text-gray-800">{pregunta}</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={cancelDelete} className="rounded-md bg-gray-300 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-400">
                Cancelar
              </button>
              <button onClick={confirm} className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700">
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
      <Cargando isLoading={isLoading} />
      {notification.visible && (
        <div
          className={`fixed right-4 top-4 z-[999] flex items-center rounded-lg p-4 text-white shadow-lg transition-transform duration-300 transform ${notification.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
            ${notification.type === 'success' ? 'bg-green-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}
        >
          <div className="flex-1">
            <p className="font-semibold">{notification.message}</p>
          </div>
          {/* Usamos la nueva función del hook para ocultar la notificación */}
          <button onClick={hideNotification} className="ml-4 text-white opacity-70 hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default function UsuariosPage() {
  return (
    <div className="p-10 flex-1 overflow-auto">
      <RazonesSocialesCRUD />
    </div>
  );
}
