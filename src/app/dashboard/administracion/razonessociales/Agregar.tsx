
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Importa el hook useRouter
import ToggleSwitch from "@/src/hooks/ToggleSwitch";
import Cargando from '@/src/hooks/Cargando';
import { useNotification } from '@/src/hooks/useNotifications';
import { RazonSocial } from '@/src/Interfaces/Interfaces';

interface RegimenFiscal {
  Clave: string;
  Nombre: string;
}

// Definimos una interfaz para las propiedades del modal de registro
interface ModalProps {
  idEditar?: string;
  Editar: boolean;
  onClose: () => void;
  onRegister: (Mensaje: string, Color: "success" | "error" | "warning") => void;
}


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

// Componente para la vista de CRUD de Usuarios
const RazonSocialAgregar = ({ idEditar, Editar = false, onClose, onRegister }: ModalProps) => {
  const router = useRouter();
  const { notification, showNotification, hideNotification } = useNotification();

  // Estado para el formulario con los nuevos campos inicializados
  const [formState, setFormState] = useState<RazonSocial>({
    Estado: 0,
    RazonSocial: "",
    RFC: "",
    TipoPersona: "", // Valor inicial para el nuevo campo
    RegimenFiscal: 0,
    CodigoPostal: "",
    Direccion: "",
  });

  const [regimenfiscales, setregimenfiscales] = useState<RegimenFiscal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inputXMLREF = useRef<HTMLInputElement | null>(null);

  // Nuevo estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState('informacion-interna');


  useEffect(() => {
    if (idEditar) {
      setFormState(prev => ({ ...prev, _id: idEditar }));
      ObtenerRazonSocial();
    }
    ListarRazonSociales();
  }, [idEditar]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  const ObtenerRazonSocial = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/razonessociales/ObtenerRazonSocial/${idEditar}`);
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setFormState(data.data);
      } else {
        const text = await response.text();
        console.error('La respuesta de la API no es JSON:', text);
        throw new Error('La API no devolvió un formato JSON válido.');
      }
    } catch (err: any) {
      console.error('Error al obtener el cliente:', err);
      setError(err.message || 'Hubo un error al cargar el cliente. Verifica que la API esté corriendo.');
    } finally {
      setIsLoading(false);
    }
  };

  const ListarRazonSociales = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/regimenfiscal`);
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setregimenfiscales(data.data);
      } else {
        const text = await response.text();
        console.error('La respuesta de la API no es JSON:', text);
        throw new Error('La API no devolvió un formato JSON válido.');
      }
    } catch (err: any) {
      console.error('Error al obtener los regímenes fiscales:', err);
      setError(err.message || 'Hubo un error al cargar los regímenes fiscales. Verifica que la API esté corriendo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar cambios en campos anidados (Representante Legal, Dueño, etc.)
  const handleNestedInputChange = (section: keyof RazonSocial, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any), // Corrección: aserción de tipo a 'any'
        [name]: value
      }
    }));
  };

  // Función para manejar cambios en campos de nivel superior
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value,
    }));
  };



  const validarDatos = () => {
    let valido = true;
    // Validaciones existentes
    if (!formState.RazonSocial || !formState.RFC || !formState.CodigoPostal || !formState.Direccion || !formState.RegimenFiscal || !formState.TipoPersona) {
      showNotification("Por favor, complete todos los campos marcados con *", "error");
      valido = false;
    }
    // Puedes agregar más validaciones para los campos de los nuevos tabs si es necesario
    return valido;
  };

  const Guardar = async () => {
    if (!validarDatos()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/razonessociales/GuardarRazonSocial`, {
        method: Editar ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(`Error: ${data.mensaje}`);
      showNotification("Razón Social guardada exitosamente", "success");
      onClose();
    } catch (err: any) {
      // console.error('Error al guardar la razón social:', err);
      showNotification(err.message || 'Hubo un error al guardar la razón social.', "error");
    } finally {
      setIsLoading(false);
    }
  };
  
  const AbrirInputXML = () => inputXMLREF.current?.click();
  
   const importarXML = (event: React.ChangeEvent<HTMLInputElement>) => {
     let { files } = event.target
    const file = files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "text/xml");

      // Obtener nodo principal <cfdi:Comprobante>
      const comprobante = xml.getElementsByTagName("cfdi:Comprobante")[0];
      if (!comprobante) {
        alert("XML no válido de CFDI SAT");
        return;
      }
      const emisor = xml.getElementsByTagName("cfdi:Emisor")[0];
      const rfc = emisor?.getAttribute("Rfc") ?? ""
      setFormState(prev => ({
        ...prev,
        RFC:rfc,
        TipoPersona: rfc.length == 12 ? "Fisica" : "Moral",
        RazonSocial:emisor?.getAttribute("Nombre") ?? "",
        RegimenFiscal: parseInt(emisor?.getAttribute("RegimenFiscal") ?? "0"),
        CodigoPostal:comprobante?.getAttribute("LugarExpedicion") ?? "",
      }));

    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-blue-900">{Editar ? "Editar Razón social" : "Agregar Razón social"}</h2>
        <div className="flex-grow mx-2">
          <button onClick={onClose} className="float-right rounded-lg bg-gray-300 px-6 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-400"          >
            Regresar
          </button>
        </div>
        <div className="flex-none">
          <button onClick={AbrirInputXML} className="rounded-lg bg-gray-300 px-6 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-400"          >
            Inportar con XML
          </button>
          <input ref={inputXMLREF} className='hidden' type="file" accept="text/xml"  onChange={importarXML}/>
        </div>
      </div>

      <Separador Titulo="Información General" />
      <div id="INFORMACION GENERAL" className='grid grid-cols-5 gap-4'>
        <div className='col-span-2'>
          <label className="block text-sm font-medium text-gray-700">Razón Social *</label>
          <input
            type="text"
            name="RazonSocial"
            value={formState.RazonSocial}
            onChange={handleInputChange}
            required
            className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className='col-span-1'>
          <label className="block text-sm font-medium text-gray-700">Código Postal *</label>
          <input
            type="number"
            name="CodigoPostal"
            value={formState.CodigoPostal}
            onChange={handleInputChange}
            required
            className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className='col-span-1'>
          <label className="block text-sm font-medium text-gray-700">RFC *</label>
          <input
            type="text"
            name="RFC"
            value={formState.RFC}
            onChange={handleInputChange}
            required
            className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className='col-span-2'>
          <label className="block text-sm font-medium text-gray-700">Tipo de Persona *</label>
          <select
            name="TipoPersona"
            value={formState.TipoPersona}
            onChange={handleInputChange}
            required
            className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          >
            <option disabled value="">Seleccione un tipo de persona</option>
            <option value="Fisica">Física</option>
            <option value="Moral">Moral</option>
          </select>
        </div>

        <div className='col-span-2'>
          <label className="block text-sm font-medium text-gray-700">Regimen Fiscal *</label>
          <select
            name="RegimenFiscal"
            value={formState.RegimenFiscal}
            onChange={handleInputChange}
            required
            className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          >
            <option disabled value={0}>Seleccione un regimen fiscal</option>
            {regimenfiscales.map((regimenfiscal) => (
              <option key={regimenfiscal.Clave} value={regimenfiscal.Clave}>
                {regimenfiscal.Clave} - {regimenfiscal.Nombre}
              </option>
            ))}
          </select>
        </div>
        <div className='col-span-5'>
          <label className="block text-sm font-medium text-gray-700">Dirección *</label>
          <textarea
            name="Direccion"
            value={formState.Direccion}
            onChange={handleInputChange}
            className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-700"
          onClick={Guardar}
        >
          Guardar
        </button>
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

export default RazonSocialAgregar;