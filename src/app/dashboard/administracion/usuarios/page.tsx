// app/dashboard/administracion/usuarios/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importa el hook useRouter

// Definimos una interfaz para el tipo de datos de un usuario
interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

// Definimos una interfaz para los datos de un nuevo usuario desde el formulario
interface NewUserForm {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  usuario: string;
  password: string;
  confirmPassword: string;
}

// Definimos una interfaz para las propiedades del modal de registro
interface RegistroUsuarioModalProps {
  onClose: () => void;
  onRegister: (newUser: User) => void;
}

// Componente para la vista de CRUD de Usuarios
const UsuariosCRUD = () => {
  // Inicializa el router para la navegación
  const router = useRouter();
  
  const [usuarios, setUsuarios] = useState<User[]>([
    { id: 1, nombre: 'Juan Pérez', email: 'juan.perez@example.com', rol: 'Administrador' },
    { id: 2, nombre: 'María García', email: 'maria.garcia@example.com', rol: 'Operador' },
    { id: 3, nombre: 'Carlos López', email: 'carlos.lopez@example.com', rol: 'Contador' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setUserIdToDelete(id);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    if (userIdToDelete !== null) {
      setUsuarios(usuarios.filter(usuario => usuario.id !== userIdToDelete));
      console.log(`Usuario con ID ${userIdToDelete} eliminado.`);
      setUserIdToDelete(null);
      setShowConfirm(false);
    }
  };

  const cancelDelete = () => {
    setUserIdToDelete(null);
    setShowConfirm(false);
  };

  // La función ahora recibe un objeto con el tipo User
  const handleRegister = (newUser: User) => {
    // Lógica para agregar un nuevo usuario al estado
    setUsuarios([...usuarios, { ...newUser, id: usuarios.length + 1 }]);
    setIsModalOpen(false); // Cierra el modal
    console.log('Nuevo usuario registrado:', newUser);
  };
  
  // Función para abrir el modal
  const handleOpenModal = () => {
    console.log("Se hizo clic en el botón 'Crear Nuevo Usuario'. Abriendo modal...");
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-blue-900">Gestión de Usuarios</h2>
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
            <tr className="bg-gray-200 text-left text-gray-700">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2">{usuario.id}</td>
                <td className="px-4 py-2">{usuario.nombre}</td>
                <td className="px-4 py-2">{usuario.email}</td>
                <td className="px-4 py-2">{usuario.rol}</td>
                <td className="px-4 py-2 flex space-x-2">
                  <button className="rounded-md bg-blue-600 px-4 py-1 text-sm text-white transition-colors duration-200 hover:bg-blue-700">
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(usuario.id)}
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

      {isModalOpen && <RegistroUsuarioModal onClose={() => setIsModalOpen(false)} onRegister={handleRegister} />}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="rounded-lg bg-white p-6 shadow-xl">
            <p className="text-lg font-semibold text-gray-800">¿Estás seguro de que quieres eliminar este usuario?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={cancelDelete} className="rounded-md bg-gray-300 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-400">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para el modal de registro de usuario
const RegistroUsuarioModal = ({ onClose, onRegister }: RegistroUsuarioModalProps) => {
  const [formState, setFormState] = useState<NewUserForm>({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    usuario: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Usa useEffect para manejar la animación de entrada y salida del modal
  useEffect(() => {
    // Si el modal se está abriendo, lo hacemos visible después de un pequeño delay
    setModalVisible(true);
    // Agrega una clase 'modal-open' al body para deshabilitar el scroll de fondo
    document.body.classList.add('overflow-hidden');
    return () => {
      // Limpia la clase cuando el componente se desmonte (el modal se cierre)
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  const handleClose = () => {
    setModalVisible(false);
    setTimeout(onClose, 300); // Espera a que termine la animación antes de cerrar
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formState.password !== formState.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }
    const newUser: User = {
      id: 0,
      nombre: `${formState.nombre} ${formState.apellidoPaterno} ${formState.apellidoMaterno}`,
      email: `${formState.usuario}@example.com`,
      rol: 'Nuevo'
    };
    onRegister(newUser);
    handleClose(); // Llama a la nueva función de cierre animado
  };

  return (
    // La animación ahora se gestiona con clases dinámicas
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${modalVisible ? 'opacity-100 backdrop-blur-sm' : 'opacity-0'}`}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.60)' // bg-white con 75% de opacidad
      }}
    >
      <div 
        className={`w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 ${modalVisible ? 'scale-100' : 'scale-95'}`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">Registrar Nuevo Usuario</h3>
          <button onClick={handleClose} className="text-gray-400 transition-colors duration-200 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formState.nombre}
              onChange={handleInputChange}
              required
              className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellido Paterno</label>
              <input
                type="text"
                name="apellidoPaterno"
                value={formState.apellidoPaterno}
                onChange={handleInputChange}
                required
                className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellido Materno</label>
              <input
                type="text"
                name="apellidoMaterno"
                value={formState.apellidoMaterno}
                onChange={handleInputChange}
                required
                className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Usuario</label>
            <input
              type="text"
              name="usuario"
              value={formState.usuario}
              onChange={handleInputChange}
              required
              className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              name="password"
              value={formState.password}
              onChange={handleInputChange}
              required
              className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              value={formState.confirmPassword}
              onChange={handleInputChange}
              required
              className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
            {passwordError && <p className="mt-1 text-sm text-red-500">{passwordError}</p>}
          </div>
          <div className="flex justify-end space-x-2">
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
            >
              Registrar
            </button>
          </div>
        </form>
      </div>
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
