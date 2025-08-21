// app/dashboard/administracion/usuarios/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importa el hook useRouter
import ToggleSwitch from "@/src/hooks/ToggleSwitch";
import Cargando from '@/src/hooks/Cargando';
import Separador from '@/src/hooks/Separador';

import { useNotification } from '@/src/hooks/useNotifications';
import { Cliente, GrupoEmpresarial, } from '@/src/Interfaces/Interfaces';

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
  });

  const router = useRouter();
  const { notification, showNotification, hideNotification } = useNotification();
  const [clientesAsociados, setClientesAsociados] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      showNotification("Razón Social guardada exitosamente", "success");
      onClose();
    } catch (err: any) {
      console.error('Error al guardar la razón social:', err);
      setError(err.message || 'Hubo un error al guardar la razón social. Verifica que la API esté corriendo y responda correctamente.');
      showNotification("Error al guardar la razón social", "error");
    } finally {
      setIsLoading(false);
    }

  }




  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-blue-900">{Editar ? "Editar Razón Social" : "Agregar Razón Social"}</h2>

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
        <label>* Datos obligatorio</label>
        <br />

        <Separador Titulo="Informacion General" />
        <div id="INFORMACION GENERAL" className='grid grid-cols-2 gap-4'>
          <div className='col-span-2'>
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
        </div>
        <br />

        <Separador Titulo="Responsable" />
        <div id="RESPONSABLE" className="grid grid-cols-6 gap-6 items-start">
          <div className="md:col-span-12 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700">
              Responsable *
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

          <div className="md:col-span-12 lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Contacto *
            </label>
            <input
              type="text"
              name="Contacto"
              value={formState.Contacto}
              onChange={handleInputChange}
              required
              className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 
                 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <br />
        <Separador Titulo="Razones sociales asociadas" />
        <div style={{ marginTop: "-10px" }}>
          <div id="RAZONES SOCIALES ASOCIADAS" className='grid grid-cols-1 gap-4'>
            <table className="table-auto">
              <tbody className="">
                {clientesAsociados.map((item, index) => (
                  <tr key={index} className="border border-gray-300">
                    <td className="px-4 py-2">{item.RazonSocial}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


        <br />
        <div id="OBSERVACIONES" className='grid grid-cols-5 gap-4'>
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
