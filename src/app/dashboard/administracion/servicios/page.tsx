"use client";

import React, { useState, useEffect, ChangeEventHandler } from 'react';

// Enum para los estados de un servicio
export enum Estatus {
    Cancelado = 'Cancelado',
    Activo = 'Activo',
    Desactivado = 'Desactivado',
}

// Interfaz para el tipo de datos de un servicio
interface Servicio {
  _id: string;
  Nombre: string;
  Descripcion: string;
  // Usamos los valores del enum para tipar el estado del servicio
  Estado: Estatus.Activo | Estatus.Desactivado;
  ActividadesServicio: string[] | { idActividad: string, Orden: number }[];
}

// Interfaz para los tipos de datos de una actividad
interface Actividad {
  _id: string;
  nombre: string;
}

// Interfaz para la actividad en el estado del formulario
interface FormActivity {
  idActividad: string;
  Orden: number;
}

type ServiceSearch = {
  Nombre: string;  
  Estado: number;  
};


const initialFormState: Omit<Servicio, 'Estado'> = {
  _id: '',
  Nombre: '',
  Descripcion: '',
  ActividadesServicio: [],
};

// URL base de tus APIs
const API_BASE_URL = 'http://localhost:5000';
const ENDPOINT_SERVICIOS = '/servicios';
const ENDPOINT_ACTIVIDADES = '/actividades';
const ENDPOINT_BUSCAR = '/Buscar';
const ENDPOINT_DESACTIVAR = '/servicios/Desactivar';
const ENDPOINT_ACTIVAR = '/servicios/Activar';


// Componente principal para la gestión de servicios
const ServiceList = () => {
  const [services, setServices] = useState<Servicio[]>([]);
  const [allActivities, setAllActivities] = useState<Actividad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  const [serviceIdToDelete, setServiceIdToDelete] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<Servicio | null>(null);
  const [formState, setFormState] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState<Partial<typeof initialFormState>>({});

  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
const [isDeactivateModalVisible, setIsDeactivateModalVisible] = useState(false);
const [serviceIdToDeactivate, setServiceIdToDeactivate] = useState<string | null>(null);

const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
const [isActivateModalVisible, setIsActivateModalVisible] = useState(false);
const [serviceIdToActivate, setServiceIdToActivate] = useState<string | null>(null);


  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | null }>({
    message: '',
    type: null,
  });

  const [selectedActivities, setSelectedActivities] = useState<FormActivity[]>([]);

  // ESTADOS PARA LOS FILTROS
  const [filterNameInput, setFilterNameInput] = useState('');
  const [filterStatusInput, setFilterStatusInput] = useState<string>('Todos');
  
  const [appliedFilterName, setAppliedFilterName] = useState('');
  const [appliedFilterStatus, setAppliedFilterStatus] = useState<string>('Todos');

  // Función para mostrar la notificación
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: null });
    }, 5000);
  };

  // Función para obtener los servicios de la API con filtros
  const fetchServices = async (name: string, status: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINT_SERVICIOS}/ObtenerLista`);
      const result = await response.json();
      if (!response.ok || !Array.isArray(result.data)) {
        throw new Error(result.message || 'La respuesta de la API de servicios no es un array válido.');
      }
      
      const servicesWithStatus = result.data.map((service: any) => ({
        ...service,
        // Mapea el valor numérico del estado (1 o 2) al valor del enum.
        Estado: service.Estado === 1 ? Estatus.Activo : Estatus.Desactivado
      })).filter((service: Servicio) => {
        const matchesName = service.Nombre.toLowerCase().includes(name.toLowerCase());
        const matchesStatus = status === 'Todos' || service.Estado === status;
        return matchesName && matchesStatus;
      });
      setServices(servicesWithStatus);
    } catch (err: any) {
      console.error('Error al obtener los servicios:', err);
      setError('Hubo un error al cargar los servicios. Verifica que la API esté corriendo y el endpoint sea correcto.');
      showNotification('Error al cargar los servicios.', 'error');
    } finally {
      setIsLoading(false);
    }
  };


const fetchServicesBuscar = async (params: ServiceSearch) => {
  setIsLoading(true);
  setError(null);

  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINT_SERVICIOS}${ENDPOINT_BUSCAR}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const result = await response.json();

    if (!response.ok || !Array.isArray(result.data)) {
      throw new Error(result.message || 'La respuesta de la API de servicios no es un array válido.');
    }

    // Normaliza Estado si viene en número
    const list = result.data as any[];
    const needsNormalize = typeof list[0]?.Estado === 'number';

    const normalized = needsNormalize
      ? list.map(s => ({
          ...s,
          Estado: s.Estado === 1 ? Estatus.Activo : Estatus.Desactivado,
        }))
      : list;

    setServices(normalized);
  } catch (err: any) {
    console.error('Error al buscar servicios:', err);
    setError('Hubo un error al buscar servicios. Verifica el endpoint y el body.');
    showNotification('Error al buscar servicios.', 'error');
  } finally {
    setIsLoading(false);
  }
};





  // Función para obtener todas las actividades disponibles
  const fetchAllActivities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINT_ACTIVIDADES}`);
      const result = await response.json();
      
      let activitiesData;
      if (result.data && Array.isArray(result.data)) {
        activitiesData = result.data;
      } else if (Array.isArray(result)) {
        activitiesData = result;
      } else {
        throw new Error('La respuesta de la API de actividades no es un array válido.');
      }
      
      setAllActivities(activitiesData);

    } catch (err: any) {
      console.error('Error al obtener las actividades:', err);
      showNotification('Error al cargar las actividades.', 'error');
    }
  };

  // Carga inicial de datos sin filtro
  useEffect(() => {
    fetchServices(appliedFilterName, appliedFilterStatus);
    fetchAllActivities();
  }, []);

  // Maneja el clic en el botón de búsqueda
  const handleSearch = () => {
  setAppliedFilterName(filterNameInput);
  setAppliedFilterStatus(filterStatusInput);

  const params: ServiceSearch = {
    Nombre: filterNameInput?.trim() || "", // siempre string
    Estado:
      filterStatusInput === Estatus.Activo
        ? 1
        : filterStatusInput === Estatus.Desactivado
        ? 2
        : 3,
  };

  fetchServicesBuscar(params);
};

const openDeactivateModal = (id: string) => {
  setServiceIdToDeactivate(id);
  setIsDeactivateModalOpen(true);
  setTimeout(() => setIsDeactivateModalVisible(true), 10);
};

const closeDeactivateModal = () => {
  setIsDeactivateModalVisible(false);
  setTimeout(() => {
    setIsDeactivateModalOpen(false);
    setServiceIdToDeactivate(null);
  }, 300);
};

const confirmDeactivateService = async () => {
  if (!serviceIdToDeactivate) return;

  setIsLoading(true);
  setError(null);
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINT_DESACTIVAR}/${serviceIdToDeactivate}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();

    if (!response.ok || result?.error) {
      throw new Error(result?.message || `Error: ${response.statusText}`);
    }

    showNotification('Servicio desactivado correctamente.', 'success');

    // Refresca respetando los filtros actuales (usar Buscar si lo tienes implementado)
    const estadoNum =
      appliedFilterStatus === Estatus.Activo ? 1 :
      appliedFilterStatus === Estatus.Desactivado ? 2 : 3;

    // Si ya implementaste fetchServicesBuscar(params):
    await fetchServicesBuscar?.({ Nombre: appliedFilterName || "", Estado: estadoNum })
      // si no existe, cae al listado base con filtro local
      ?? fetchServices(appliedFilterName, appliedFilterStatus);

  } catch (err: any) {
    console.error('Error al desactivar el servicio:', err);
    setError('Hubo un error al desactivar el servicio.');
    showNotification(`Error al desactivar el servicio: ${err.message}`, 'error');
  } finally {
    setIsLoading(false);
    closeDeactivateModal();
  }
};

const openActivateModal = (id: string) => {
  setServiceIdToActivate(id);
  setIsActivateModalOpen(true);
  setTimeout(() => setIsActivateModalVisible(true), 10);
};

const closeActivateModal = () => {
  setIsActivateModalVisible(false);
  setTimeout(() => {
    setIsActivateModalOpen(false);
    setServiceIdToActivate(null);
  }, 300);
};

const confirmActivateService = async () => {
  if (!serviceIdToActivate) return;

  setIsLoading(true);
  setError(null);
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINT_ACTIVAR}/${serviceIdToActivate}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();

    if (!response.ok || result?.error) {
      throw new Error(result?.message || `Error: ${response.statusText}`);
    }

    showNotification('Servicio acivado correctamente.', 'success');

    // Refresca respetando los filtros actuales (usar Buscar si lo tienes implementado)
    const estadoNum =
      appliedFilterStatus === Estatus.Activo ? 1 :
      appliedFilterStatus === Estatus.Desactivado ? 2 : 3;

    // Si ya implementaste fetchServicesBuscar(params):
    await fetchServicesBuscar?.({ Nombre: appliedFilterName || "", Estado: estadoNum })
      // si no existe, cae al listado base con filtro local
      ?? fetchServices(appliedFilterName, appliedFilterStatus);

  } catch (err: any) {
    console.error('Error al activar el servicio:', err);
    setError('Hubo un error al activar el servicio.');
    showNotification(`Error al activar el servicio: ${err.message}`, 'error');
  } finally {
    setIsLoading(false);
    closeActivateModal();
  }
};


  // Maneja los cambios en los campos del formulario
  const handleFormChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Lógica de validación
  const validateForm = () => {
    const errors: Partial<typeof initialFormState> = {};
    if (!formState.Nombre.trim()) errors.Nombre = 'El nombre es obligatorio.';
    if (!formState.Descripcion.trim()) errors.Descripcion = 'La descripción es obligatoria.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Maneja el guardado del servicio (crear o editar)
  const handleSaveService = async () => {
    if (!validateForm()) {
      showNotification('Por favor, completa todos los campos obligatorios.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      let response;

      if (editingService) {
        // En el modo de edición, enviamos todo el objeto, incluyendo el ID y el estado actual.
        const dataToSave = { 
            _id: editingService._id,
            Nombre: formState.Nombre,
            Descripcion: formState.Descripcion,
            // Conservamos el estado original del servicio para no cambiarlo
            Estado: editingService.Estado,
            ActividadesServicio: selectedActivities
        };

        response = await fetch(`${API_BASE_URL}${ENDPOINT_SERVICIOS}/actualizar`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave),
        });
      } else {
        // En el modo de registro, NO enviamos el ID ni el Estado.
        const { _id, ActividadesServicio, ...newDataToSave } = formState;

        response = await fetch(`${API_BASE_URL}${ENDPOINT_SERVICIOS}/registrar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newDataToSave,
            ActividadesServicio: selectedActivities,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.statusText}`);
      }
      
      await fetchServices(appliedFilterName, appliedFilterStatus);
      handleCloseFormModal();
      showNotification('Servicio guardado correctamente.', 'success');
    } catch (err: any) {
      console.error('Error al guardar el servicio:', err);
      showNotification(`Error al guardar el servicio: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenFormModal = (service: Servicio | null = null) => {
    setEditingService(service);
    setFormState(service ? { ...service, _id: service._id } : initialFormState);
    
    if (service && Array.isArray(service.ActividadesServicio)) {
      const activitiesWithOrder = service.ActividadesServicio.map((actividad, index) => {
        const id = typeof actividad === 'string' ? actividad : (actividad as any).idActividad;
        return { idActividad: id, Orden: index + 1 };
      });
      setSelectedActivities(activitiesWithOrder);
    } else {
      setSelectedActivities([]);
    }
    
    setFormErrors({});
    setIsFormModalOpen(true);
    setTimeout(() => setIsFormModalVisible(true), 10);
  };

  const handleCloseFormModal = () => {
    setIsFormModalVisible(false);
    setTimeout(() => {
      setIsFormModalOpen(false);
      setEditingService(null);
      setFormState(initialFormState);
      setSelectedActivities([]);
    }, 300);
  };

  // Manejadores de eliminación
  const handleDelete = (id: string) => {
    setServiceIdToDelete(id);
    setIsConfirmModalOpen(true);
    setTimeout(() => setIsConfirmModalVisible(true), 10);
  };

  const confirmDelete = async () => {
    if (serviceIdToDelete !== null) {
      const id = serviceIdToDelete;
      try {
        const response = await fetch(`${API_BASE_URL}${ENDPOINT_SERVICIOS}/Eliminar/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error: ${response.statusText}`);
        }
        await fetchServices(appliedFilterName, appliedFilterStatus);
        showNotification('Servicio eliminado correctamente.', 'success');
      } catch (err: any) {
        console.error('Error al eliminar el servicio:', err);
        showNotification(`Error al eliminar el servicio: ${err.message}`, 'error');
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
      setServiceIdToDelete(null);
      setIsConfirmModalOpen(false);
    }, 300);
  };

  // Lógica para mover actividades entre las listas
  const handleAddActivity = (activityId: string) => {
    if (selectedActivities.some(act => act.idActividad === activityId)) {
      return;
    }
    const newOrder = selectedActivities.length + 1;
    setSelectedActivities(prev => [...prev, { idActividad: activityId, Orden: newOrder }]);
  };

  const handleRemoveActivity = (activityId: string) => {
    const updatedActivities = selectedActivities.filter(act => act.idActividad !== activityId);
    
    const reorderedActivities = updatedActivities.map((act, index) => ({
      ...act,
      Orden: index + 1,
    }));
    
    setSelectedActivities(reorderedActivities);
  };

  const getAvailableActivities = () => {
    const selectedIds = new Set(selectedActivities.map(act => act.idActividad));
    return allActivities.filter(activity => !selectedIds.has(activity._id));
  };
  
  const getSelectedActivities = () => {
    return selectedActivities
      .sort((a, b) => a.Orden - b.Orden)
      .map(formAct => {
        const activity = allActivities.find(act => act._id === formAct.idActividad);
        return {
          ...formAct,
          Nombre: activity ? activity.nombre : 'Desconocida',
        };
      });
  };

  // Efecto para controlar el scroll del body
  useEffect(() => {
    if (isFormModalOpen || isConfirmModalOpen || isDeactivateModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isFormModalOpen, isConfirmModalOpen, isDeactivateModalOpen]);

  return (
    <div className="space-y-6 p-4 font-sans bg-gray-50 min-h-screen">
      {/* Componente de Notificación */}
      {notification.message && (
        <div className={`fixed top-4 right-4 z-[60] rounded-xl px-6 py-3 text-white shadow-xl transition-transform duration-300 transform ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-600'} ${notification.message ? 'translate-x-0' : 'translate-x-full'}`}>
          <p className="font-semibold">{notification.message}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-blue-900">Gestión de Servicios</h2>
        <button
          onClick={() => handleOpenFormModal()}
          className="rounded-lg bg-yellow-400 px-6 py-2 text-gray-900 font-semibold transition-colors duration-200 hover:bg-yellow-500 shadow-md"
        >
          Crear Nuevo Servicio
        </button>
      </div>

      {/* Controles de Filtrado */}
      <div className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-center">
        {/* Cambios para limitar el ancho del campo Nombre a 1/3 */}
        <div className="w-full md:w-1/3">
          <label htmlFor="filterName" className="block text-sm font-medium text-gray-700 mb-1">Buscar por nombre</label>
          <input
            type="text"
            id="filterName"
            value={filterNameInput}
            onChange={(e) => setFilterNameInput(e.target.value)}
            placeholder="Introduce el nombre del servicio"
            className="w-full rounded-lg border border-gray-300 p-2 focus:ring focus:ring-blue-200 focus:border-blue-500 transition"
          />
        </div>
        {/* El campo de estado y el botón de búsqueda se ajustan al espacio restante */}
        <div className="w-full md:w-1/3">
          <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">Filtrar por estado</label>
          <select
            id="filterStatus"
            value={filterStatusInput}
            onChange={(e) => setFilterStatusInput(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 focus:ring focus:ring-blue-200 focus:border-blue-500 transition"
          >
            <option value="Todos">Todos</option>
             {/* Mapea los valores del enum para las opciones del select */}
            {Object.values(Estatus)
              .filter(status => status !== Estatus.Cancelado) // Ignora 'Cancelado'
              .map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
          </select>
        </div>
        <div className="w-full md:w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1 opacity-0 pointer-events-none">Buscar</label>
          <button
            onClick={handleSearch}
            className="w-full rounded-lg bg-blue-600 px-6 py-2 text-white font-semibold transition-colors duration-200 hover:bg-blue-700 shadow-md"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Lista de servicios */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-xl font-semibold text-blue-900">Cargando servicios...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-xl font-semibold text-red-600">Error: {error}</p>
        </div>
      ) : services.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-xl font-semibold text-gray-500">
            No se encontraron servicios que coincidan con la búsqueda.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white p-6 shadow-md">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-left text-gray-700">
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Descripción</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service._id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-2">{service.Nombre}</td>
                  <td className="px-4 py-2">{service.Descripcion}</td>
                  <td className="px-4 py-2">
                    <span className={`py-1 px-3 rounded-full text-xs font-semibold ${
                      service.Estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {service.Estado}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex space-x-2">
                    <button onClick={() => handleOpenFormModal(service)} className="rounded-md bg-blue-600 px-4 py-1 text-sm text-white transition-colors duration-200 hover:bg-blue-700">
                      Editar
                    </button>
                    {service.Estado === Estatus.Activo && (
                        <button
                        onClick={() => openDeactivateModal(service._id)}
                        className="rounded-md bg-amber-600 px-4 py-1 text-sm text-white transition-colors duration-200 hover:bg-amber-700"
                        title="Desactivar servicio"
                        >
                        Desactivar
                        </button>
                    )}
                    {service.Estado === Estatus.Desactivado && (
                        <button
                        onClick={() => openActivateModal(service._id)}
                        className="rounded-md bg-green-600 px-4 py-1 text-sm text-white transition-colors duration-200 hover:bg-green-700"
                        title="Activar servicio"
                        >
                        Activar
                        </button>
                    )}
                    <button
                      onClick={() => handleDelete(service._id)}
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
            <p className="text-lg font-semibold text-gray-800">¿Estás seguro de que quieres eliminar este servicio?</p>
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

      {isDeactivateModalOpen && (
  <div
    className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isDeactivateModalVisible ? 'opacity-100 backdrop-blur-sm' : 'opacity-0'}`}
    style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
  >
    <div className={`w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-amber-500 ${isDeactivateModalVisible ? 'scale-100' : 'scale-95'}`}>
      <p className="text-lg font-semibold text-gray-800">
        ¿Estás seguro de que quieres desactivar este servicio?
      </p>
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={closeDeactivateModal}
          className="rounded-md bg-gray-300 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-400"
        >
          Cancelar
        </button>
        <button
          onClick={confirmDeactivateService}
          className="rounded-md bg-amber-600 px-4 py-2 text-white transition-colors hover:bg-amber-700"
        >
          Desactivar
        </button>
      </div>
    </div>
  </div>
)}

{isActivateModalOpen && (
  <div
    className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isActivateModalVisible ? 'opacity-100 backdrop-blur-sm' : 'opacity-0'}`}
    style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
  >
    <div className={`w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-green-500 ${isActivateModalVisible ? 'scale-100' : 'scale-95'}`}>
      <p className="text-lg font-semibold text-gray-800">
        ¿Estás seguro de que quieres activar este servicio?
      </p>
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={closeActivateModal}
          className="rounded-md bg-gray-300 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-400"
        >
          Cancelar
        </button>
        <button
          onClick={confirmActivateService}
          className="rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
        >
          Activar
        </button>
      </div>
    </div>
  </div>
)}


      
      {/* Modal para crear o editar servicio */}
      {isFormModalOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isFormModalVisible ? 'opacity-100 backdrop-blur-sm' : 'opacity-0'}`}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
        >
          <div className={`w-full max-w-4xl rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 ${isFormModalVisible ? 'scale-100' : 'scale-95'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingService ? 'Editar Servicio' : 'Crear Nuevo Servicio'}
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
                  Nombre del Servicio
                </label>
                <input
                  type="text"
                  id="Nombre"
                  name="Nombre"
                  value={formState.Nombre}
                  onChange={handleFormChange}
                  className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${formErrors.Nombre ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.Nombre && <p className="mt-1 text-sm text-red-600">{formErrors.Nombre}</p>}
              </div>
              <div>
                <label htmlFor="Descripcion" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  id="Descripcion"
                  name="Descripcion"
                  rows={3}
                  value={formState.Descripcion}
                  onChange={handleFormChange}
                  className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${formErrors.Descripcion ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.Descripcion && <p className="mt-1 text-sm text-red-600">{formErrors.Descripcion}</p>}
              </div>
              
              {/* Sección de actividades */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900">Asignar Actividades</h4>
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mt-4">
                  {/* Lista de actividades disponibles */}
                  <div className="w-full md:w-1/2 bg-gray-100 rounded-lg p-4 h-80 overflow-y-auto border border-gray-300 shadow-inner">
                    <h5 className="font-medium text-gray-700 mb-2">Disponibles</h5>
                    {getAvailableActivities().length > 0 ? (
                      <ul className="space-y-2">
                        {getAvailableActivities().map(activity => (
                          <li key={activity._id} className="flex items-center justify-between bg-white rounded-md p-2 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                            <span className="text-sm text-gray-800">{activity.nombre}</span>
                            <button
                              onClick={() => handleAddActivity(activity._id)}
                              className="rounded-full bg-blue-500 text-white w-6 h-6 flex items-center justify-center text-xs transition-transform transform hover:scale-110"
                            >
                              +
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-sm text-gray-500">No hay más actividades disponibles.</p>
                    )}
                  </div>

                  {/* Lista de actividades seleccionadas */}
                  <div className="w-full md:w-1/2 bg-gray-100 rounded-lg p-4 h-80 overflow-y-auto border border-gray-300 shadow-inner">
                    <h5 className="font-medium text-gray-700 mb-2">Asignadas al Servicio</h5>
                    {getSelectedActivities().length > 0 ? (
                      <ul className="space-y-2">
                        {getSelectedActivities().map(formAct => (
                          <li key={formAct.idActividad} className="flex items-center justify-between bg-white rounded-md p-2 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                            <span className="text-sm text-gray-800">{formAct.Orden}. {formAct.Nombre}</span>
                            <button
                              onClick={() => handleRemoveActivity(formAct.idActividad)}
                              className="rounded-full bg-red-500 text-white w-6 h-6 flex items-center justify-center text-xs transition-transform transform hover:scale-110"
                            >
                              -
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-sm text-gray-500">Agrega actividades de la lista de la izquierda.</p>
                    )}
                  </div>
                </div>
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
                onClick={handleSaveService}
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

export default function ServiceManagementPage() {
  return (
    <div className="p-10 flex-1 overflow-auto bg-gray-50">
      <ServiceList />
    </div>
  );
}
