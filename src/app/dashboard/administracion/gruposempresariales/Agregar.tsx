'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cargando from '@/src/hooks/Cargando';



import { useNotification } from '@/src/hooks/useNotifications';
import { Cliente, GrupoEmpresarial } from '@/src/Interfaces/Interfaces';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';



// Definimos una interfaz para las propiedades del modal de registro
interface ModalProps {
  idEditar?: string;
  Editar: boolean;
  onClose: () => void;
  onRegister: (Mensaje: string, Color: "success" | "error" | "warning") => void;
}


// Componente para la vista de CRUD de Usuarios
const GruposEmpresarialesAgregar = ({ idEditar, Editar = false, onClose, onRegister }: ModalProps) => {
  // Inicializa el router para la navegación
  const [formState, setFormState] = useState<GrupoEmpresarial>({
    Nombre: "",
    Responsable: "",
    idResponsable: "",
    Contacto: "",
    Observaciones: "",
    ContactoPrincipal: { Nombre: '', Telefono: '', Correo: '' }
  });

  const router = useRouter();
  const { notification, showNotification, hideNotification } = useNotification();
  const [clientesAsociados, setClientesAsociados] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  type Contribuyente = {
    id: string;
    RazonSocial: string;
  };
  // Mock de una base de datos de contribuyentes para simular datos
  const mockContribuyentes: Contribuyente[] = [
    { id: '1', RazonSocial: 'Contribuyente A S.A. de C.V.' },
    { id: '2', RazonSocial: 'Contribuyente B S. de R.L.' },
    { id: '3', RazonSocial: 'Contribuyente C S.C.' },
    { id: '4', RazonSocial: 'Contribuyente D S.A.' },
    { id: '5', RazonSocial: 'Contribuyente E S. de C.V.' },
  ];


  const [clientesAsociados1, setClientesAsociados1] = useState<Contribuyente[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // El estado de los resultados de búsqueda también es tipado
  const [searchResults, setSearchResults] = useState<Contribuyente[]>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term.length > 2) {
      // Filtra los resultados si el término de búsqueda tiene más de 2 caracteres
      const results = mockContribuyentes.filter(contribuyente =>
        contribuyente.RazonSocial.toLowerCase().includes(term)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // El parámetro 'contribuyente' ahora tiene un tipo explícito
  const addContribuyente = (contribuyente: Contribuyente) => {
    // Evita duplicados en la lista
    if (!clientesAsociados1.some(c => c.id === contribuyente.id)) {
      setClientesAsociados1([...clientesAsociados1, contribuyente]);
    }
    // Cierra el modal y limpia el estado de búsqueda
    setIsModalOpen(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  // Lógica para eliminar un contribuyente de la lista
  const removeContribuyente = (id: string) => {
    // Filtra la lista para crear una nueva sin el contribuyente eliminado
    setClientesAsociados1(clientesAsociados1.filter(c => c.id !== id));
  };


  useEffect(() => {
    if (idEditar) {
      setFormState({
        ...formState,
        _id: idEditar,
      });
      ObtenerPorId();
      ObtenerClientesDelGrupo()
    }

  }, []);

  interface SeparadorProps {
    Titulo: string;
  }

  const Separador = ({ Titulo }: SeparadorProps) => {
    return (
      <div className="flex items-center my-8">
        <span className="flex-shrink text-xl font-bold tracking-tight text-blue-900 bg-transparent pr-4">
          {Titulo}
        </span>
        <div className="flex-grow border-t-2 border-blue-900"></div>
      </div>
    );
  };

  const ObtenerPorId = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/gruposempresariales/ObtenerPorId/${idEditar}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      // Se añade un manejo de errores más robusto al intentar parsear la respuesta
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setFormState(data.data);
      } else {
        const text = await response.text();
        throw new Error('La API no devolvió un formato JSON válido.');
      }
    } catch (err: any) {
      console.error('Error al obtener las actividades:', err);
      setError(err.message || 'Hubo un error al cargar las actividades. Verifica que la API esté corriendo y responda correctamente.');
    } finally {
      setIsLoading(false);
    }
  };
  const ObtenerClientesDelGrupo = async () => {
    setIsLoading(true);
    setClientesAsociados([]);
    try {
      const response = await fetch(`${API_BASE_URL}/gruposempresariales/ObtenerClientesDelGrupo/${idEditar}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      // Se añade un manejo de errores más robusto al intentar parsear la respuesta
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setClientesAsociados(data.data);
      } else {
        const text = await response.text();
        setClientesAsociados([]);
        throw new Error('La API no devolvió un formato JSON válido.');
      }
    } catch (err: any) {
      setError(err.message || 'Hubo un error al cargar las actividades. Verifica que la API esté corriendo y responda correctamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name == "TipoResposable") {
      setFormState(prev => ({
        ...prev,
        Responsable: "",
        idResponsable: null,
      }));
    }
    setFormState(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  const validarDatos = () => {
    let valido = true;

    if (!valido) {
      showNotification("Por favor, complete todos los campos", "error");
    }

    return valido
  }
  const Guardar = async () => {
    if (!validarDatos()) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/gruposempresariales/GuardarGrupoEmpresarial`, {

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
      showNotification("Grupo empresarial guardado exitosamente", "success");
      onClose();
    } catch (err: any) {
      console.error('Error al guardar el grupo empresarial:', err);
      setError(err.message || 'Hubo un error al guardar el grupo empresarial. Verifica que la API esté corriendo y responda correctamente.');
      showNotification("Error al guardar el grupo emrpesarial", "error");
    } finally {
      setIsLoading(false);
    }

  }


  const handleNestedInputChange = (section: keyof GrupoEmpresarial, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any), // Corrección: aserción de tipo a 'any'
        [name]: value
      }
    }));
  };

   // Lógica para cerrar el modal y limpiar el estado
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSearchTerm('');
    setSearchResults([]);
  };


  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-blue-900">{Editar ? "Editar Grupo Empresarial" : "Agregar Grupo Empresarial"}</h2>

        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-300 px-6 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-400"
          >
            Regresar
          </button>
        </div>
      </div>

      <div className="grid overflow-x-auto rounded-xl bg-white p-6 shadow-md">

        <Separador Titulo="Información General" />
        <div id="INFORMACION GENERAL" className='grid grid-cols-2 gap-4'>
          <div className='col-span-1'>
            <label className="block text-sm font-medium text-gray-700">Nombre *</label>
            <input
              type="text"
              name="Nombre"
              value={formState.Nombre}
              onChange={handleInputChange}
              required
              className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700">
              Responsable Comercial*
            </label>
            <input
              type="text"
              name="Responsable"
              value={formState.Responsable}
              onChange={handleInputChange}
              required
              className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 
                 focus:border-blue-500 focus:ring-blue-500"
            />

          </div>

          <div className='col-span-5'>
            <label className="block text-sm font-medium text-gray-700">Observaciones</label>
            <textarea
              name="Observaciones"
              value={formState.Observaciones}
              onChange={handleInputChange}
              className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <Separador Titulo="Contacto Principal" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className='col-span-1'>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="Nombre"
              value={formState.ContactoPrincipal.Nombre}
              onChange={(e) => handleNestedInputChange('ContactoPrincipal', e)}
              className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className='col-span-1'>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              type="tel"
              name="Telefono"
              value={formState.ContactoPrincipal.Telefono}
              onChange={(e) => handleNestedInputChange('ContactoPrincipal', e)}
              className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className='col-span-1'>
            <label className="block text-sm font-medium text-gray-700">Correo</label>
            <input
              type="email"
              name="Correo"
              value={formState.ContactoPrincipal.Correo}
              onChange={(e) => handleNestedInputChange('ContactoPrincipal', e)}
              className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

        </div>

        <Separador Titulo="Contribuyentes asociados" />
        <div style={{ marginTop: "-10px" }}>
          <div className="p-4 bg-gray-100 font-sans">                     
        <div className="mt-4">
          <div className='grid grid-cols-1 gap-4'>
            <div className="flex justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded-full transition-colors duration-200">
              Asociar Contribuyente
            </button>
          </div>            
            <table className="table-auto w-full border-collapse">
              <tbody className="">
                {clientesAsociados1.length > 0 ? (
                  clientesAsociados1.map((item) => (
                    <tr key={item.id} className="border-t border-gray-300 last:border-b">
                      <td className="px-4 py-2 text-gray-800">{item.RazonSocial}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => removeContribuyente(item.id)}
                          className="text-red-500 hover:text-red-700 font-bold transition-colors duration-200">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-2 text-gray-500 italic" colSpan={2}>No hay contribuyentes asociados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>                    
        </div>
            
            

            {/* Modal de Búsqueda */}
            {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
          >
            <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 scale-100">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Buscar Contribuyente</h3>
                <button onClick={handleCloseModal} className="text-gray-400 transition-colors duration-200 hover:text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {searchTerm.length > 2 && searchResults.length > 0 && (
                  <ul className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                    {searchResults.map((contribuyente) => (
                      <li
                        key={contribuyente.id}
                        onClick={() => addContribuyente(contribuyente)}
                        className="p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                      >
                        {contribuyente.RazonSocial}
                      </li>
                    ))}
                  </ul>
                )}

                {searchTerm.length > 2 && searchResults.length === 0 && (
                  <p className="mt-4 text-sm text-gray-500">No se encontraron resultados.</p>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="rounded-md bg-gray-300 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-400"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

          </div>



        </div>

        <br />
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-700"
            onClick={Guardar}
          >
            Guardar
          </button>
        </div>

      </div>

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


export default GruposEmpresarialesAgregar
