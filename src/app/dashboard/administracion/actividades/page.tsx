// app/dashboard/administracion/actividades/page.tsx

'use client';

import { useState, useMemo, useEffect } from 'react';

// Interfaz para el tipo de datos de una actividad, usando _id de MongoDB
interface Actividad {
  _id: string;
  nombre: string;
  descripcion: string;
  frecuencia: 'Diaria' | 'Semanal' | 'Mensual' | 'Trimestral';
}

// Nueva interfaz para el estado del formulario
interface ActividadFormState extends Omit<Actividad, '_id'> {
  _id: string | null;
}

// Valores iniciales para el formulario
const initialFormState: ActividadFormState = {
  _id: null,
  nombre: '',
  descripcion: '',
  frecuencia: 'Diaria',
};

// URL base de tu API de NestJS, ahora usando una variable de entorno
// La URL base no debe incluir el endpoint.
// Asegúrate de definir NEXT_PUBLIC_API_BASE_URL en tu archivo .env.local (ej: http://localhost:3000)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
const ENDPOINT_ACTUAL = '/actividades';

// Componente para la vista de listado de actividades
const ActividadesListado = () => {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  
  const [actividadIdToDelete, setActividadIdToDelete] = useState<string | null>(null);
  const [editingActividad, setEditingActividad] = useState<Actividad | null>(null);
  const [formState, setFormState] = useState<ActividadFormState>(initialFormState);
  
  const [nombreFilter, setNombreFilter] = useState('');
  const [frecuenciaFilter, setFrecuenciaFilter] = useState('Todas');

  // Función para obtener las actividades de la API
  const fetchActividades = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINT_ACTUAL}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      // Se añade un manejo de errores más robusto al intentar parsear la respuesta
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data: Actividad[] = await response.json();
        setActividades(data);
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

  // Carga las actividades al montar el componente
  useEffect(() => {
    fetchActividades();
  }, []);

  // Lógica de filtrado
  const filteredActividades = useMemo(() => {
    return actividades.filter(actividad => {
      const matchesNombre = actividad.nombre.toLowerCase().includes(nombreFilter.toLowerCase());
      const matchesFrecuencia = frecuenciaFilter === 'Todas' || actividad.frecuencia === frecuenciaFilter;
      return matchesNombre && matchesFrecuencia;
    });
  }, [actividades, nombreFilter, frecuenciaFilter]);

  // Manejadores para el formulario
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveActividad = async () => {
    try {
      let response;
      if (editingActividad) {
        // Petición PUT para actualizar
        response = await fetch(`${API_BASE_URL}${ENDPOINT_ACTUAL}/${editingActividad._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formState),
        });
      } else {
        // Petición POST para crear
        response = await fetch(`${API_BASE_URL}${ENDPOINT_ACTUAL}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formState),
        });
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      // Vuelve a cargar la lista para ver los cambios
      fetchActividades();
      handleCloseFormModal();
    } catch (err: any) {
      console.error('Error al guardar la actividad:', err);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  const handleOpenFormModal = (actividad: Actividad | null = null) => {
    setEditingActividad(actividad);
    setFormState(actividad ? { ...actividad } : initialFormState);
    setIsFormModalOpen(true);
    setTimeout(() => setIsFormModalVisible(true), 10);
  };

  const handleCloseFormModal = () => {
    setIsFormModalVisible(false);
    setTimeout(() => {
      setIsFormModalOpen(false);
      setEditingActividad(null);
      setFormState(initialFormState);
    }, 300); // 300ms para la transición
  };

  // Manejadores de eliminación
  const handleDelete = (id: string) => {
    setActividadIdToDelete(id);
    setIsConfirmModalOpen(true);
    setTimeout(() => setIsConfirmModalVisible(true), 10);
  };

  const confirmDelete = async () => {
    if (actividadIdToDelete !== null) {
      try {
        const response = await fetch(`${API_BASE_URL}${ENDPOINT_ACTUAL}/${actividadIdToDelete}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        console.log(`Actividad con ID ${actividadIdToDelete} eliminada.`);
        // Vuelve a cargar la lista para ver los cambios
        fetchActividades();
      } catch (err) {
        console.error('Error al eliminar la actividad:', err);
        // Aquí podrías mostrar un mensaje de error al usuario
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
        setActividadIdToDelete(null);
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
        <p className="text-xl font-semibold text-blue-900">Cargando actividades...</p>
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
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-blue-900">Gestión de Actividades</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => handleOpenFormModal()}
            className="rounded-lg bg-yellow-400 px-6 py-2 text-gray-900 font-semibold transition-colors duration-200 hover:bg-yellow-500"
          >
            Crear Nueva Actividad
          </button>
        </div>
      </div>

      {/* Controles de filtro con mejor estilo */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-full sm:w-1/2">
            <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">
              Filtrar por Nombre
            </label>
            <input
              type="text"
              id="nombreFilter"
              value={nombreFilter}
              onChange={(e) => setNombreFilter(e.target.value)}
              placeholder="Buscar por nombre..."
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="w-full sm:w-1/2">
            <label htmlFor="frecuenciaFilter" className="block text-sm font-medium text-gray-700">
              Filtrar por Frecuencia
            </label>
            <select
              id="frecuenciaFilter"
              value={frecuenciaFilter}
              onChange={(e) => setFrecuenciaFilter(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option>Todas</option>
              <option>Diaria</option>
              <option>Semanal</option>
              <option>Mensual</option>
              <option>Trimestral</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white p-6 shadow-md">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-left text-gray-700">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Descripción</th>
              <th className="px-4 py-2">Frecuencia</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredActividades.map(actividad => (
              <tr key={actividad._id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2">{actividad._id}</td>
                <td className="px-4 py-2">{actividad.nombre}</td>
                <td className="px-4 py-2">{actividad.descripcion}</td>
                <td className="px-4 py-2">{actividad.frecuencia}</td>
                <td className="px-4 py-2 flex space-x-2">
                  <button onClick={() => handleOpenFormModal(actividad)} className="rounded-md bg-blue-600 px-4 py-1 text-sm text-white transition-colors duration-200 hover:bg-blue-700">
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(actividad._id)}
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

      {/* Modal de confirmación de eliminación con animación */}
      {isConfirmModalOpen && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isConfirmModalVisible ? 'opacity-100 backdrop-blur-sm' : 'opacity-0'}`}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
        >
          <div className={`w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 ${isConfirmModalVisible ? 'scale-100' : 'scale-95'}`}>
            <p className="text-lg font-semibold text-gray-800">¿Estás seguro de que quieres eliminar esta actividad?</p>
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
      
      {/* Modal para crear o editar actividad con animación */}
      {isFormModalOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isFormModalVisible ? 'opacity-100 backdrop-blur-sm' : 'opacity-0'}`}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
        >
          <div className={`w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 ${isFormModalVisible ? 'scale-100' : 'scale-95'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingActividad ? 'Editar Actividad' : 'Crear Nueva Actividad'}
              </h3>
              <button onClick={handleCloseFormModal} className="text-gray-400 transition-colors duration-200 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formState.nombre}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formState.descripcion}
                  onChange={handleFormChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                ></textarea>
              </div>
              <div>
                <label htmlFor="frecuencia" className="block text-sm font-medium text-gray-700">
                  Frecuencia
                </label>
                <select
                  id="frecuencia"
                  name="frecuencia"
                  value={formState.frecuencia}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option>Diaria</option>
                  <option>Semanal</option>
                  <option>Mensual</option>
                  <option>Trimestral</option>
                </select>
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
                onClick={handleSaveActividad}
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

export default function ActividadesPage() {
  return (
    <div className="p-10 flex-1 overflow-auto">
      <ActividadesListado />
    </div>
  );
}
