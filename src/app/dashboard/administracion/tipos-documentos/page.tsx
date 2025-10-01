// app/dashboard/administracion/tipos-documentos/page.tsx

'use client';

import { useState, useMemo, useEffect, ChangeEventHandler } from 'react';
// Importamos el custom hook para las notificaciones con la ruta corregida
import { useNotification } from '@/src/hooks/useNotifications';
import { API_BASE_URL } from '@/src/utils/constantes';
import { useRouter } from 'next/navigation';

// Interfaz para el tipo de datos de un tipo de documento
interface TipoDocumento {
  _id: string;
  Nombre: string;
  Descripcion: string;
}

// Nueva interfaz para el estado del formulario
interface TipoDocumentoFormState extends Omit<TipoDocumento, '_id'> {
  _id: string | null;
}

// Valores iniciales para el formulario
const initialFormState: TipoDocumentoFormState = {
  _id: null,
  Nombre: '',
  Descripcion: '',
};

// Endpoint corregido
const ENDPOINT_BASE = '/tiposdocumentos';

// Componente para la vista de listado de tipos de documento
const TiposDocumentosListado = () => {
  const router = useRouter();
  const [tiposDocumentos, setTiposDocumentos] = useState<TipoDocumento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  const [tipoDocumentoIdToDelete, setTipoDocumentoIdToDelete] = useState<string | null>(null);
  const [editingTipoDocumento, setEditingTipoDocumento] = useState<TipoDocumento | null>(null);
  const [formState, setFormState] = useState<TipoDocumentoFormState>(initialFormState);
  
  // NUEVO: Estado para los errores de validación del formulario
  const [formErrors, setFormErrors] = useState<Partial<TipoDocumentoFormState>>({});

  // Usamos el custom hook para gestionar las notificaciones
  const { notification, showNotification, hideNotification } = useNotification();

  // Función para obtener los tipos de documento de la API con el método correcto
  const fetchTiposDocumentos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // URL corregida para el listado de documentos
      const response = await fetch(`${API_BASE_URL}${ENDPOINT_BASE}/ObtenerListadoTiposDocumento`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        // Verificamos si la respuesta tiene la estructura esperada
        console.log(result);
        if (result && result.data) {
          setTiposDocumentos(result.data);
        } else {
          // Si la respuesta no tiene la propiedad `data`, asumimos que la lista viene directamente
          setTiposDocumentos(result);
        }
      } else {
        const text = await response.text();
        console.error('La respuesta de la API no es JSON:', text);
        throw new Error('La API no devolvió un formato JSON válido.');
      }
    } catch (err: any) {
      console.error('Error al obtener los tipos de documento:', err);
      setError(err.message || 'Hubo un error al cargar los tipos de documento. Verifica que la API esté corriendo y responda correctamente.');
      showNotification('Error al cargar los tipos de documento.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Carga los tipos de documento al montar el componente
  useEffect(() => {
    fetchTiposDocumentos();
  }, []);

  // Manejadores para el formulario
  const handleFormChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    
    // NUEVO: Limpiamos el error del campo cuando el usuario comienza a escribir
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSaveTipoDocumento = async () => {
    // NUEVO: Creamos un objeto para guardar los errores
    const newErrors: Partial<TipoDocumentoFormState> = {};
    if (!formState.Nombre.trim()) {
      newErrors.Nombre = 'El Nombre es un campo obligatorio.';
    }

    // NUEVO: Actualizamos el estado de errores
    setFormErrors(newErrors);

    // NUEVO: Si hay algún error, detenemos la función y no hacemos la llamada a la API
    if (Object.keys(newErrors).length > 0) {
      showNotification('Por favor, completa todos los campos obligatorios.', 'error');
      return;
    }

    try {
      let response;
      if (editingTipoDocumento) {
        console.log('entro al editar');
        // Petición PUT para actualizar
        response = await fetch(`${API_BASE_URL}${ENDPOINT_BASE}/Guardar`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formState),
        });
      } else {
        // Petición POST para crear
        response = await fetch(`${API_BASE_URL}${ENDPOINT_BASE}/Guardar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formState),
        });
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      fetchTiposDocumentos();
      handleCloseFormModal();
      showNotification('Tipo de documento guardado correctamente.', 'success');
    } catch (err: any) {
      console.error('Error al guardar el tipo de documento:', err);
      showNotification('Error al guardar el tipo de documento.', 'error');
    }
  };

  const handleOpenFormModal = (tipoDocumento: TipoDocumento | null = null) => {
    setEditingTipoDocumento(tipoDocumento);
    setFormState(tipoDocumento ? { ...tipoDocumento } : initialFormState);
    
    // NUEVO: Limpiamos los errores del formulario cada vez que se abre el modal
    setFormErrors({});

    setIsFormModalOpen(true);
    setTimeout(() => setIsFormModalVisible(true), 10);
  };

  const handleCloseFormModal = () => {
    setIsFormModalVisible(false);
    setTimeout(() => {
      setIsFormModalOpen(false);
      setEditingTipoDocumento(null);
      setFormState(initialFormState);
    }, 300); // 300ms para la transición
  };

  // Manejadores de eliminación
  const handleDelete = (id: string) => {
    setTipoDocumentoIdToDelete(id);
    setIsConfirmModalOpen(true);
    setTimeout(() => setIsConfirmModalVisible(true), 10);
  };

  const confirmDelete = async () => {
    if (tipoDocumentoIdToDelete !== null) {
      try {
        const response = await fetch(`${API_BASE_URL}${ENDPOINT_BASE}/EliminarTipoDocumento/${tipoDocumentoIdToDelete}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        console.log(`Tipo de documento con ID ${tipoDocumentoIdToDelete} eliminado.`);
        fetchTiposDocumentos();
        showNotification('Tipo de documento eliminado correctamente.', 'success');
      } catch (err) {
        console.error('Error al eliminar el tipo de documento:', err);
        showNotification('Error al eliminar el tipo de documento.', 'error');
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
        setTipoDocumentoIdToDelete(null);
        setIsConfirmModalOpen(false);
    }, 300); // 300ms para la transición
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

  // Renderizado condicional
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold text-blue-900">Cargando tipos de documento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Notificación */}
      {notification.visible && (
        <div 
          className={`fixed right-4 top-4 z-[999] flex items-center rounded-lg p-4 text-white shadow-lg transition-transform duration-300 transform ${notification.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
            ${notification.type === 'success' ? 'bg-green-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}
        >
          <div className="flex-1">
            <p className="font-semibold">{notification.message}</p>
          </div>
          <button onClick={hideNotification} className="ml-4 text-white opacity-70 hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-blue-900">Gestión de Tipos de Documentos</h2>
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
            onClick={() => handleOpenFormModal()}
            className="rounded-lg bg-yellow-400 px-6 py-2 text-gray-900 font-semibold transition-colors duration-200 hover:bg-yellow-500"
          >
            Crear Nuevo Tipo de Documento
          </button>
        </div>
      </div>
      
      {/* Nuevo bloque de renderizado condicional para mostrar la tabla o un mensaje */}
      {tiposDocumentos.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-xl font-semibold text-gray-500">
            No se encontraron tipos de documentos. ¡Crea uno para empezar!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white p-6 shadow-md">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-left text-gray-700">
              <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Descripción</th>
                <th className="px-4 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tiposDocumentos.map(tipo => (
                <tr key={tipo._id} className="border-t border-gray-200 hover:bg-gray-50">            
                  <td className="px-4 py-2">{tipo.Nombre}</td>
                  <td className="px-4 py-2">{tipo.Descripcion}</td>
                  <td className="px-4 py-2 flex space-x-2 float-right">
                    <button onClick={() => handleOpenFormModal(tipo)} className="rounded-md bg-blue-600 px-4 py-1 text-sm text-white transition-colors duration-200 hover:bg-blue-700">
                      <i className="material-symbols-rounded filled">stylus</i>
                    </button>
                    <button
                      onClick={() => handleDelete(tipo._id)}
                      className="rounded-md bg-red-600 px-4 py-1 text-sm text-white transition-colors duration-200 hover:bg-red-700"
                    >
                      <i className="material-symbols-rounded filled">delete</i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmación de eliminación con animación */}
      {isConfirmModalOpen && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isConfirmModalVisible ? 'opacity-100 backdrop-blur-sm' : 'opacity-0'}`}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
        >
          <div className={`w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 ${isConfirmModalVisible ? 'scale-100' : 'scale-95'}`}>
            <p className="text-lg font-semibold text-gray-800">¿Estás seguro de que quieres eliminar este tipo de documento?</p>
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
      
      {/* Modal para crear o editar tipo de documento con animación */}
      {isFormModalOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isFormModalVisible ? 'opacity-100 backdrop-blur-sm' : 'opacity-0'}`}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
        >
          <div className={`w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 ${isFormModalVisible ? 'scale-100' : 'scale-95'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingTipoDocumento ? 'Editar Tipo de Documento' : 'Crear Nuevo Tipo de Documento'}
              </h3>
              <button onClick={handleCloseFormModal} className="text-gray-400 transition-colors duration-200 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="Nombre" className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  id="Nombre"
                  name="Nombre"
                  value={formState.Nombre}
                  onChange={handleFormChange}
                  className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${formErrors.Nombre ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {/* NUEVO: Mostramos el mensaje de error si existe */}
                {formErrors.Nombre && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.Nombre}</p>
                )}
              </div>
              <div>
                <label htmlFor="Descripcion" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  id="Descripcion"
                  name="Descripcion"
                  value={formState.Descripcion}
                  onChange={handleFormChange}
                  rows={3}
                  className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${formErrors.Descripcion ? 'border-red-500' : 'border-gray-300'}`}
                  required
                ></textarea>
                {/* NUEVO: Mostramos el mensaje de error si existe */}
                {formErrors.Descripcion && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.Descripcion}</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={handleCloseFormModal}
                className="rounded-md bg-gray-300 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTipoDocumento}
                className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function TiposDocumentosPage() {
  return (
    <div className="p-10 flex-1 overflow-auto">
      <TiposDocumentosListado />
    </div>
  );
}
