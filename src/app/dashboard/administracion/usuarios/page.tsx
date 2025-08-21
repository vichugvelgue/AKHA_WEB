"use client";

import React, { useState, useEffect, ChangeEventHandler } from 'react';
import { API_BASE_URL } from '@/src/utils/constantes';
// Interfaz para el tipo de datos de un usuario
interface User {
  _id: string;
  Nombres: string;
  Apellidos: string;
  Correo: string;
  idTipoUsuario: string;
}

// Interfaz para los tipos de usuario
interface UserType {
  _id: string;
  Nombre: string;
}

// Interfaz para el estado del formulario de usuario
interface UserFormState extends Omit<User, '_id'> {
  _id: string | null;
  Contrasena?: string;
  ConfirmarContrasena?: string;
}

// Interfaz para los criterios de búsqueda
interface SearchCriteria {
  Nombres: string;
  Correo: string;
  idTipoUsuario: string;
}

// Valores iniciales para el formulario
const initialFormState: UserFormState = {
  _id: null,
  Nombres: '',
  Apellidos: '',
  Correo: '',
  Contrasena: '',
  ConfirmarContrasena: '',
  idTipoUsuario: '',
};

// Valores iniciales para los filtros de búsqueda
const initialSearchState: SearchCriteria = {
  Nombres: '',
  Correo: '',
  idTipoUsuario: '',
};

// URL base de tus APIs
const ENDPOINT_BASE = '/usuarios';
const ENDPOINT_BUSCAR = '/Buscar';
const ENDPOINT_TIPOS = '/TiposUsuario/ObternerListadoTiposUsuario';

// Componente principal para la gestión de usuarios
const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formState, setFormState] = useState<UserFormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<Partial<UserFormState>>({});

  // Nuevo estado para los criterios de búsqueda
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>(initialSearchState);

  // Estado para la notificación
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | null }>({
    message: '',
    type: null,
  });

  // Función para mostrar la notificación
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: null });
    }, 5000); // La notificación desaparece después de 5 segundos
  };

  // Función para obtener los usuarios de la API, ahora acepta parámetros de búsqueda
  const fetchUsers = async (params: SearchCriteria = initialSearchState) => {
    setIsLoading(true);
    setError(null);

    try {
      // Petición POST con los parámetros de búsqueda en el body
      const response = await fetch(`${API_BASE_URL}${ENDPOINT_BASE}${ENDPOINT_BUSCAR}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const result = await response.json();
      
      if (!response.ok || !Array.isArray(result.data)) {
        throw new Error(result.message || 'La respuesta de la API de usuarios no es un array válido.');
      }        
      setUsers(result.data);
    } catch (err: any) {
      console.error('Error al obtener los usuarios:', err);
      setError('Hubo un error al cargar los usuarios. Verifica que la API esté corriendo y el endpoint sea correcto.');
      showNotification('Error al cargar los usuarios.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener los tipos de usuario de la API
  const fetchUserTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINT_TIPOS}`);
      const result = await response.json();

      if (!response.ok || !Array.isArray(result.data)) {
        throw new Error(result.message || 'La respuesta de la API de tipos de usuario no es un array válido.');
      }
      setUserTypes(result.data);
    } catch (err: any) {
      console.error('Error al obtener los tipos de usuario:', err);
      showNotification('Error al cargar los tipos de usuario.', 'error');
    }
  };

  // Carga los usuarios y tipos de usuario al montar el componente
  useEffect(() => {
    fetchUsers(initialSearchState); // Carga la lista completa al inicio
    fetchUserTypes();
  }, []);

  // Maneja los cambios en los campos del formulario
  const handleFormChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    // Limpiamos el error del campo cuando el usuario comienza a escribir
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Maneja los cambios en los campos del filtro de búsqueda
  const handleSearchChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = (e) => {
    const { name, value } = e.target;
    setSearchCriteria(prev => ({ ...prev, [name]: value }));
  };

  // Lógica de validación
  const validateForm = () => {
    const errors: Partial<UserFormState> = {};
    if (!formState.Nombres.trim()) errors.Nombres = 'El nombre es obligatorio.';
    if (!formState.Apellidos.trim()) errors.Apellidos = 'Los apellidos son obligatorios.';
    if (!formState.Correo.trim()) {
      errors.Correo = 'El correo es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(formState.Correo)) {
      errors.Correo = 'El formato del correo no es válido.';
    }
    if (!formState.idTipoUsuario) errors.idTipoUsuario = 'El tipo de usuario es obligatorio.';
    
    // Validación de contraseña: si el campo no está vacío, validamos
    if (formState.Contrasena && formState.Contrasena.trim() !== '') {
        if (formState.Contrasena.length < 6) {
            errors.Contrasena = 'La contraseña debe tener al menos 6 caracteres.';
        }
        if (formState.Contrasena !== formState.ConfirmarContrasena) {
            errors.ConfirmarContrasena = 'Las contraseñas no coinciden.';
        }
    } else if (!editingUser) {
      // Si estamos creando un nuevo usuario, la contraseña es obligatoria.
      errors.Contrasena = 'La contraseña es obligatoria.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Maneja el guardado del usuario (crear o editar)
  const handleSaveUser = async () => {
    if (!validateForm()) {
      showNotification('Por favor, completa todos los campos obligatorios y corrige los errores.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      let response;
      const dataToSave: any = { ...formState };

      if (editingUser && formState.Contrasena?.trim() === '') {
        delete dataToSave.Contrasena;
        delete dataToSave.ConfirmarContrasena;
      }
      
      if (editingUser) {
        // Petición PUT para actualizar
        response = await fetch(`${API_BASE_URL}${ENDPOINT_BASE}/Actualizar`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave),
        });
      } else {
        // Petición POST para crear
        response = await fetch(`${API_BASE_URL}${ENDPOINT_BASE}/Registrar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave),
        });
      }            
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.statusText}`);
      }
      
      await fetchUsers();
      handleCloseFormModal();
      showNotification('Usuario guardado correctamente.', 'success');
    } catch (err: any) {
      console.error('Error al guardar el usuario:', err);
      showNotification(`Error al guardar el usuario: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Maneja la búsqueda de usuarios
  const handleSearch = () => {
    fetchUsers(searchCriteria);
  };

  // Maneja la limpieza de filtros y carga todos los usuarios
  const handleClearSearch = () => {
    setSearchCriteria(initialSearchState);
    fetchUsers();
  };


  const handleOpenFormModal = (user: User | null = null) => {
    setEditingUser(user);
    setFormState(user ? { ...user, _id: user._id, Contrasena: '', ConfirmarContrasena: '' } : initialFormState);
    setFormErrors({});
    setIsFormModalOpen(true);
    setTimeout(() => setIsFormModalVisible(true), 10);
  };

  const handleCloseFormModal = () => {
    setIsFormModalVisible(false);
    setTimeout(() => {
      setIsFormModalOpen(false);
      setEditingUser(null);
      setFormState(initialFormState);
    }, 300);
  };

  // Manejadores de eliminación
  const handleDelete = (id: string) => {
    setUserIdToDelete(id);
    setIsConfirmModalOpen(true);
    setTimeout(() => setIsConfirmModalVisible(true), 10);
  };

  const confirmDelete = async () => {
    if (userIdToDelete !== null) {
      const id = userIdToDelete;
      try {
        const response = await fetch(`${API_BASE_URL}${ENDPOINT_BASE}/Eliminar/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error: ${response.statusText}`);
        }
        
        await fetchUsers();
        showNotification('Usuario eliminado correctamente.', 'success');
      } catch (err: any) {
        console.error('Error al eliminar el usuario:', err);
        showNotification(`Error al eliminar el usuario: ${err.message}`, 'error');
      }
    }
    handleCloseConfirmModal();
  };

  const cancelDelete = () => {
    handleCloseConfirmModal();
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalVisible(false);
    setTimeout(() => {
      setUserIdToDelete(null);
      setIsConfirmModalOpen(false);
    }, 300);
  };
  
  // Efecto para controlar el scroll del body
  useEffect(() => {
    if (isFormModalOpen || isConfirmModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isFormModalOpen, isConfirmModalOpen]);

  return (
    <div className="space-y-6 p-4">
      {/* Componente de Notificación */}
      {notification.message && (
        <div className={`fixed top-4 right-4 z-[60] rounded-xl px-6 py-3 text-white shadow-xl transition-transform duration-300 transform ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-600'} ${notification.message ? 'translate-x-0' : 'translate-x-full'}`}>
          <p className="font-semibold">{notification.message}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-blue-900">Gestión de Usuarios</h2>
        <button
          onClick={() => handleOpenFormModal()}
          className="rounded-lg bg-yellow-400 px-6 py-2 text-gray-900 font-semibold transition-colors duration-200 hover:bg-yellow-500"
        >
          Crear Nuevo Usuario
        </button>
      </div>
      
      {/* Formulario de búsqueda */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h3 className="text-xl font-bold mb-4 text-gray-900">Buscar Usuarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search-Nombres" className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              id="search-Nombres"
              name="Nombres"
              value={searchCriteria.Nombres}
              onChange={handleSearchChange}
              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="search-Correo" className="block text-sm font-medium text-gray-700">
              Correo
            </label>
            <input
              type="text"
              id="search-Correo"
              name="Correo"
              value={searchCriteria.Correo}
              onChange={handleSearchChange}
              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="search-idTipoUsuario" className="block text-sm font-medium text-gray-700">
              Tipo de Usuario
            </label>
            <select
              id="search-idTipoUsuario"
              name="idTipoUsuario"
              value={searchCriteria.idTipoUsuario}
              onChange={handleSearchChange}
              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {userTypes.map(type => (
                <option key={type._id} value={type._id}>{type.Nombre}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleClearSearch}
            className="rounded-lg bg-gray-300 px-6 py-2 text-gray-900 font-semibold transition-colors duration-200 hover:bg-gray-400"
          >
            Limpiar Filtros
          </button>
          <button
            onClick={handleSearch}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white font-semibold transition-colors duration-200 hover:bg-blue-700"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Lista de usuarios */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-xl font-semibold text-blue-900">Cargando usuarios...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-xl font-semibold text-red-600">Error: {error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-xl font-semibold text-gray-500">
            No se encontraron usuarios. ¡Crea uno para empezar!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white p-6 shadow-md">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-left text-gray-700">
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Apellidos</th>
                <th className="px-4 py-2">Correo</th>
                <th className="px-4 py-2">Tipo de Usuario</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-t border-gray-200 hover:bg-gray-50">            
                  <td className="px-4 py-2">{user.Nombres}</td>
                  <td className="px-4 py-2">{user.Apellidos}</td>
                  <td className="px-4 py-2">{user.Correo}</td>
                  <td className="px-4 py-2">
                    {userTypes.find(type => type._id === user.idTipoUsuario)?.Nombre || 'Desconocido'}
                  </td>
                  <td className="px-4 py-2 flex space-x-2">
                    <button onClick={() => handleOpenFormModal(user)} className="rounded-md bg-blue-600 px-4 py-1 text-sm text-white transition-colors duration-200 hover:bg-blue-700">
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
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
      )}

      {/* Modal de confirmación de eliminación */}
      {isConfirmModalOpen && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isConfirmModalVisible ? 'opacity-100 backdrop-blur-sm' : 'opacity-0'}`}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
        >
          <div className={`w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 ${isConfirmModalVisible ? 'scale-100' : 'scale-95'}`}>
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
      
      {/* Modal para crear o editar usuario */}
      {isFormModalOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isFormModalVisible ? 'opacity-100 backdrop-blur-sm' : 'opacity-0'}`}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
        >
          <div className={`w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 ${isFormModalVisible ? 'scale-100' : 'scale-95'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h3>
              <button onClick={handleCloseFormModal} className="text-gray-400 transition-colors duration-200 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="Nombres" className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  id="Nombres"
                  name="Nombres"
                  value={formState.Nombres}
                  onChange={handleFormChange}
                  className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${formErrors.Nombres ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.Nombres && <p className="mt-1 text-sm text-red-600">{formErrors.Nombres}</p>}
              </div>
              <div>
                <label htmlFor="Apellidos" className="block text-sm font-medium text-gray-700">
                  Apellidos
                </label>
                <input
                  type="text"
                  id="Apellidos"
                  name="Apellidos"
                  value={formState.Apellidos}
                  onChange={handleFormChange}
                  className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${formErrors.Apellidos ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.Apellidos && <p className="mt-1 text-sm text-red-600">{formErrors.Apellidos}</p>}
              </div>
              <div>
                <label htmlFor="Correo" className="block text-sm font-medium text-gray-700">
                  Correo
                </label>
                <input
                  type="email"
                  id="Correo"
                  name="Correo"
                  value={formState.Correo}
                  onChange={handleFormChange}
                  className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${formErrors.Correo ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.Correo && <p className="mt-1 text-sm text-red-600">{formErrors.Correo}</p>}
              </div>
              <div>
                <label htmlFor="idTipoUsuario" className="block text-sm font-medium text-gray-700">
                  Tipo de Usuario
                </label>
                <select
                  id="idTipoUsuario"
                  name="idTipoUsuario"
                  value={formState.idTipoUsuario}
                  onChange={handleFormChange}
                  className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${formErrors.idTipoUsuario ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Selecciona un tipo</option>
                  {userTypes.map(type => (
                    <option key={type._id} value={type._id}>{type.Nombre}</option>
                  ))}
                </select>
                {formErrors.idTipoUsuario && <p className="mt-1 text-sm text-red-600">{formErrors.idTipoUsuario}</p>}
              </div>
              <div>
                <label htmlFor="Contrasena" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="Contrasena"
                  name="Contrasena"
                  value={formState.Contrasena}
                  onChange={handleFormChange}
                  className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${formErrors.Contrasena ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.Contrasena && <p className="mt-1 text-sm text-red-600">{formErrors.Contrasena}</p>}
              </div>
              <div>
                <label htmlFor="ConfirmarContrasena" className="block text-sm font-medium text-gray-700">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  id="ConfirmarContrasena"
                  name="ConfirmarContrasena"
                  value={formState.ConfirmarContrasena}
                  onChange={handleFormChange}
                  className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${formErrors.ConfirmarContrasena ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.ConfirmarContrasena && <p className="mt-1 text-sm text-red-600">{formErrors.ConfirmarContrasena}</p>}
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={handleCloseFormModal}
                className="rounded-md bg-gray-300 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-400"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUser}
                className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                disabled={isSaving}
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function UserManagementPage() {
  return (
    <div className="p-10 flex-1 overflow-auto">
      <UserList />
    </div>
  );
}
