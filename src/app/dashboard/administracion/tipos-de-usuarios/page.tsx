// app/dashboard/administracion/usuarios/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importa el hook useRouter
import ToggleSwitch from "@/src/app/componentes/ToggleSwitch";
import Cargando from '@/src/app/componentes/Cargando';
import { useNotification } from '@/src/hooks/useNotifications';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';


// Definimos una interfaz para el tipo de datos de un usuario
interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

// Definimos una interfaz para los datos de un nuevo usuario desde el formulario
interface TipoUsuario {
  _id?: string | null;
  Nombre: string;
  Estado?: number;
  Permisos?: Permiso[];
}
interface Modulo {
  idPadre?: string;
  _id?: string;
  Nombre?: string;
  Estado?: number;
  FechaCreacion?: Date;
  seleccionado?: boolean;

}

interface Permiso {
  _id?: string;
  idTipoUsuario?: string | null;
  idModulo: string;
}

// Definimos una interfaz para las propiedades del modal de registro
interface RegistroUsuarioModalProps {
  idEditar?: string;
  Editar: boolean;
  onClose: () => void;
  onRegister: (Mensaje: string, Color: "success" | "error" | "warning") => void;
}

// Componente para la vista de CRUD de Usuarios
const UsuariosCRUD = () => {
  // Inicializa el router para la navegación
  const router = useRouter();
const { notification, showNotification, hideNotification } = useNotification();

  const [tiposUsuarios, setTiposUsuarios] = useState<TipoUsuario[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [idTipoUsuarioToEdit, setIdTipoUsuarioToEdit] = useState<string>("");
  const [editar, setEditar] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pregunta, setPregunta] = useState<string>("");
  const [operacion, setOperacion] = useState<string>("");

  useEffect(() => {
    ListarTiposUsuarios();
  }, []);

  const ListarTiposUsuarios = async () => {
    setIsLoading(true);
    setTiposUsuarios([]);
    try {
      const response = await fetch(`${API_BASE_URL}/TiposUsuario/ObternerListadoTiposUsuario`);
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
    setPregunta("¿Estás seguro de que quieres eliminar este tipo de usuario?");
    setOperacion("eliminar");
    setIdTipoUsuarioToEdit(id);
    setShowConfirm(true);
  };
  const handleDesactivar = (id: string = "") => {
    setPregunta("¿Estás seguro de que quieres desactivar/activar este tipo de usuario?");
    setOperacion("desactivar");
    setIdTipoUsuarioToEdit(id);
    setShowConfirm(true);
  };

  const cancelDelete = () => {
    setPregunta("");
    setOperacion("");
    setIdTipoUsuarioToEdit("");
    setShowConfirm(false);
  }
  const confirm = () => {
    debugger
    if (idTipoUsuarioToEdit !== "") {
      if (operacion == "eliminar") {
        EliminarTipoUsuario(idTipoUsuarioToEdit);
      } else if (operacion == "desactivar") {
        DesactivarTipoUsuario(idTipoUsuarioToEdit);
      }
    }
    setIdTipoUsuarioToEdit("");
    setShowConfirm(false);
  };

  const DesactivarTipoUsuario = async (id: string = "") => {
    try {
      const response = await fetch(`${API_BASE_URL}/TiposUsuario/DesactivarTipoUsuario/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      showNotification(data.mensaje, "success");
      ListarTiposUsuarios();
    } catch (err: any) {
      showNotification(err.message || 'Hubo un error al desactivar/activar el tipo de usuario. Verifica que la API esté corriendo y responda correctamente.', "error");
    }
  };
  
  const EliminarTipoUsuario = async (id: string = "") => {
    try {
      const response = await fetch(`${API_BASE_URL}/TiposUsuario/EliminarTipoUsuario/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      showNotification(data.mensaje, "success");
      ListarTiposUsuarios();
    } catch (err: any) {
      showNotification(err.message || 'Hubo un error al desactivar/activar el tipo de usuario. Verifica que la API esté corriendo y responda correctamente.', "error");
    }
  };

  // La función ahora recibe un objeto con el tipo User
  const handleRegister = (Mensaje: string, Color: "success" | "error" | "warning" = "success" )  => {
    showNotification(Mensaje, Color);
    setIsModalOpen(false);
    ListarTiposUsuarios();
  };

  // Función para abrir el modal
  const handleOpenModal = () => {
    setIdTipoUsuarioToEdit("");
    setEditar(false);
    setIsModalOpen(true);
  };
  const handleEditModal = (id: string = "") => {
    setIdTipoUsuarioToEdit(id);
    setEditar(true);
    setIsModalOpen(true);
  };
  const handleCloceModal = () => {
    setIsModalOpen(false);
    ListarTiposUsuarios();
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-blue-900">Gestión de tipos de usuarios</h2>

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
            Crear Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white p-6 shadow-md">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-left text-gray-700 ">
              <th className="px-4 py-2 ">Nombre</th>
              <th className=" px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tiposUsuarios.map(usuario => (
              <tr key={usuario._id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2">{usuario.Nombre}</td>
                <td className="px-4 py-2 flex justify-end space-x-2 ">
                  <button onClick={() => handleEditModal(usuario._id || "")} className="rounded-md bg-blue-600 px-4 py-1 text-sm text-white transition-colors duration-200 hover:bg-blue-700">
                    Editar
                  </button>
                  <button
                    onClick={() => handleDesactivar(usuario._id || "")}
                    className="rounded-md bg-yellow-600 px-4 py-1 text-sm text-white transition-colors duration-200 hover:bg-yellow-700"
                  >
                    {usuario.Estado == 1 ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    onClick={() => handleDelete(usuario._id || "")}
                    className="rounded-md bg-red-600 px-4 py-1 text-sm text-white transition-colors duration-200 hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && <RegistroUsuarioModal idEditar={idTipoUsuarioToEdit} Editar={editar} onClose={handleCloceModal} onRegister={handleRegister} />}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="rounded-lg bg-white p-6 shadow-xl">
            <p className="text-lg font-semibold text-gray-800">{pregunta}</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={cancelDelete} className="rounded-md bg-gray-300 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-400">
                Cancelar
              </button>
              <button onClick={confirm} className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      <Cargando isLoading={isLoading}  />
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

// Componente para el modal de registro de usuario
const RegistroUsuarioModal = ({ idEditar, Editar = false, onClose, onRegister }: RegistroUsuarioModalProps) => {
  const { notification, showNotification, hideNotification } = useNotification();

  const [formState, setFormState] = useState<TipoUsuario>({
    _id: null,
    Nombre: '',
    Permisos: []
  });
  const [tab, setTab] = useState('');
  const [modalVisible, setModalVisible] = useState(true);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [modulosPadres, setModulosPadres] = useState<Modulo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Usa useEffect para manejar la animación de entrada y salida del modal
  useEffect(() => {
    const iniciarModal = async () => {
      let nuevosModulos= await ObtenerModulos();
      // Si el modal se está abriendo, lo hacemos visible después de un pequeño delay
      if (Editar) {
        let permisos:Permiso[] = await ObtenerPorID();

        console.log("nuevosModulos", modulos);
        for (let modulo of nuevosModulos) {
          const tienePermiso = permisos?.some(item => item.idModulo == modulo._id);

          console.log(tienePermiso);
          modulo.seleccionado = tienePermiso
        }
        console.log(nuevosModulos);
        setModulos(nuevosModulos);
      }
    }
    iniciarModal();
    // Agrega una clase 'modal-open' al body para deshabilitar el scroll de fondo
    document.body.classList.add('overflow-hidden');
    return () => {
      // Limpia la clase cuando el componente se desmonte (el modal se cierre)
      document.body.classList.remove('overflow-hidden');
    };

  }, []);

  const ObtenerPorID = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/TiposUsuario/ObtenerPorId/${idEditar}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      // Se añade un manejo de errores más robusto al intentar parsear la respuesta
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setFormState(data.data);
        return data.data.Permisos;
      } else {
        const text = await response.text();
        throw new Error('La API no devolvió un formato JSON válido.');
      }
    } catch (err: any) {
      setError(err.message || 'Hubo un error al cargar las actividades. Verifica que la API esté corriendo y responda correctamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const ObtenerModulos = async () => {
    setIsLoading(true);
    setError(null);
    setModulos([]);
    setModulosPadres([]);
    try {
      const response = await fetch(`${API_BASE_URL}/TiposUsuario/ObternerListadoModulos`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      // Se añade un manejo de errores más robusto al intentar parsear la respuesta
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setModulos(data.data);
        setModulosPadres(data.data.filter((modulo: Modulo) => modulo.idPadre == null));
        return data.data;
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
  const validarFormulario = () => {
    if (!formState.Nombre) {
      showNotification("El nombre es requerido", "warning");
      return false;
    }
    if (formState.Permisos?.length == 0) {
      showNotification("Debe seleccionar al menos un módulo", "warning");
      return false;
    }
    return true;
  }

  const Guardar = async () => {
    if (!validarFormulario()) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/TiposUsuario/Guardar`, {
        method: Editar ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Error: ${data.mensaje}`);
      }
      onRegister("Usuario guardado con éxito", "success");
    } catch (err: any) {
      console.error('Error al guardar el usuario:', err);
      setError(err.message || 'Hubo un error al guardar el usuario. Verifica que la API esté corriendo y responda correctamente.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleClose = () => {
    // setModalVisible(false);
    // setTimeout(() => onClose("", ""), 300);
    onClose()
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    onRegister("Usuario guardado con éxito", "success");
  };

  const SeleccionarModulo = (index: number) => {
    let nuevosModulos = [...modulos]; // copia superficial del arreglo
    nuevosModulos[index].seleccionado = !nuevosModulos[index].seleccionado;

    setModulos(nuevosModulos);

    if (nuevosModulos[index].seleccionado) {
      let permiso: Permiso = {
        idTipoUsuario: formState._id,
        idModulo: nuevosModulos[index]._id!,
      }
      formState.Permisos?.push(permiso)
    } else {
      formState.Permisos = formState.Permisos?.filter((permiso) => permiso.idModulo !== nuevosModulos[index]._id);
    }

  };


  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold text-red-600">Error: {error}</p>
      </div>
    );
  }
  return (
    // La animación ahora se gestiona con clases dinámicas
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${modalVisible ? 'opacity-100 backdrop-blur-sm' : 'opacity-0'}`}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.60)' // bg-white con 75% de opacidad
      }}
    >
      <div
        className={`w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 ${modalVisible ? 'scale-100' : 'scale-95'}`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">Registrar Nuevo Usuario</h3>
          <button onClick={handleClose} className="text-gray-400 transition-colors duration-200 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del rol</label>
            <input
              type="text"
              name="Nombre"
              value={formState.Nombre}
              onChange={handleInputChange}
              required
              className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="tab">
            {modulosPadres.map((modulo: Modulo, index) => (
              <button key={modulo._id} className="tablinks" type='button' onClick={() => setTab(modulo._id!)}>{modulo.Nombre}</button>
            ))}
          </div>
          <div className="tabcontent">
            {
              modulos.map((modulo: Modulo, index) => (
                <div hidden={modulo.idPadre != tab} key={modulo._id} className="flex items-center justify-between mb-2">
                  <h4>{modulo.Nombre}</h4>
                  <ToggleSwitch enabled={modulo.seleccionado} onChange={() => SeleccionarModulo(index)} />
                </div>
              ))
            }
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md bg-gray-300 px-4 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-700"
              onClick={Guardar}
            >
              Registrar
            </button>
          </div>
      </div>
      <Cargando isLoading={isLoading}  />
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
      <UsuariosCRUD />
    </div>
  );
}
