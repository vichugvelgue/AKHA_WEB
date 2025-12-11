
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Importa el hook useRouter
import ToggleSwitch from "@/src/hooks/ToggleSwitch";
import Cargando from '@/src/hooks/Cargando';
import { useNotification } from '@/src/hooks/useNotifications';
import { Cliente, PersonaContacto, RepresentanteLegal, ServicioSeleccionado } from '@/src/Interfaces/Interfaces';
import { ObtenerSesionUsuario } from '@/src/utils/constantes';



// Definición de interfaces para los nuevos campos

type ActividadServicio = {
  idActividad: string,
  orden: number
};

type ActividadesDetalle = {
  _id: string,
  edicion: boolean,
  nombre: string
}

type servicioItem = {
  _id: string;
  Nombre: string;
  Estado: number;
  ActividadesServicio: ActividadServicio[],
  ActividadesDetalle: ActividadesDetalle[],
  Costo: number
};



interface RegimenFiscal {
  Clave: string;
  Nombre: string;
}

// Definimos una interfaz para las propiedades del modal de registro
interface ModalProps {
  idEditar?: string;
  Editar?: boolean;
  onClose: () => void;
  onRegister: (Mensaje: string, Color: "success" | "error" | "warning", contribuyente: Cliente) => void;
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
}

// Componente para la vista de CRUD de Usuarios
const ContribuyentesAgregar = ({ idEditar, Editar = false, onClose, onRegister }: ModalProps) => {
  const sesion = ObtenerSesionUsuario();
  const router = useRouter();
  const { notification, showNotification, hideNotification } = useNotification();

  // Estado para el formulario con los nuevos campos inicializados
  const [formState, setFormState] = useState<Cliente>({
    Estado: 0,
    RazonSocial: "",
    RFC: "",
    TipoPersona: "", // Valor inicial para el nuevo campo
    RegimenFiscal: 0,
    CodigoPostal: "",
    Direccion: "",
    ClasificacionComercial: "",
    OrigenContacto: "",
    RecomendadoPor: "",
    ValorGrupo: "",
    CanalPreferente: "",
    CorreoInstitucional: "",
    CorreoElectronico: "",
    NumeroTelefono: "",
    WhatsApp: "",
    Observaciones: "",
    Servicios: [],
    ServiciosSeleccionados: [],
    ActividadesSeleccionadas: [],
    ServiciosContribuyente: [],
    idUsuarioCreacion: "",
    idGrupoEmpresarial: "",
    idContador: "",
    Cumpleanos: "",
    // Inicializar los objetos de contacto
    RepresentanteLegal: {
      Nombre: "",
      RFC: "",
      Alias: "",
      Cumpleanos: ""
    },
    DuenoEmpresa: {
      Nombre: "",
      Telefono: "",
      Correo: "",
      Cumpleanos: ""
    },
    ContactoCobranza: {
      Nombre: "",
      Telefono: "",
      Correo: "",
      Cumpleanos: ""
    },
    GerenteOperativo: {
      Nombre: "",
      Telefono: "",
      Correo: "",
      Cumpleanos: ""
    },
    EnlaceAkha: {
      Nombre: "",
      Telefono: "",
      Correo: "",
    }
  });

  const [regimenfiscales, setregimenfiscales] = useState<RegimenFiscal[]>([]);
  const [servicios, setservicios] = useState<servicioItem[]>([]);
  const [ServiciosSeleccionados, setSelectedServicios] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inputXMLREF = useRef<HTMLInputElement | null>(null);

  // Nuevo estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState('informacion-interna');

  // Definimos las pestañas en un arreglo para que sea más escalable
  const tabs = [
    { id: 'informacion-interna', label: 'Información Interna' },
    { id: 'contactos-empresa', label: 'Contactos de la Empresa' },
    { id: 'enlace-akha', label: 'Enlace AKHA' },
    { id: 'servicios', label: 'Servicios' },

  ];

  useEffect(() => {
    if (idEditar) {
      setFormState(prev => ({ ...prev, _id: idEditar }));
      ObtenerRazonSocial();
    } else {
      setFormState(prev => ({
        ...prev,
        idUsuarioCreacion: sesion.idUsuario
      }));
    }
    listarServicios();
    ListarRazonSociales();
  }, []);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  const ObtenerRazonSocial = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/clientes/ObtenerCliente/${idEditar}`);
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        const clienteData = data.data;

        // Inicializar ServiciosSeleccionados con los IDs de servicios que ya tienen actividades
        const serviciosConActividades = clienteData.ServiciosContribuyente?.map(
          (sc: any) => sc.idServicio
        ) || [];

        setFormState({
          ...clienteData,
          ServiciosSeleccionados: serviciosConActividades
        });
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

  const listarServicios = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Servicios/ObtenerLista`);
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'La respuesta de la API de servicios no es un array válido.');
      }
      console.log("aqui es");
      console.log(result.data);
      setservicios(result.data);
    } catch (err: any) {
      showNotification('Error al cargar los servicios.', 'error');
    }
  };

  // Función para manejar cambios en campos anidados (Representante Legal, Dueño, etc.)
  const handleNestedInputChange = (section: keyof Cliente, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
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


  // Función para manejar el toggle del acordeón
  const handleServicioSelect = (servicioId: string) => {
    setFormState(prevState => {
      const isExpanded = prevState.ServiciosSeleccionados.includes(servicioId);
      return {
        ...prevState,
        ServiciosSeleccionados: isExpanded
          ? prevState.ServiciosSeleccionados.filter(id => id !== servicioId)
          : [...prevState.ServiciosSeleccionados, servicioId]
      };
    });
  };
  const handleServicioContribuyenteSelect = (servicioId: string, idActividad: string) => {
    let serviciosActivos = formState.ServiciosContribuyente;
    let servicio = serviciosActivos?.find((s: any) => s.idServicio === servicioId);
    if (servicio) {
      if (!servicio.ListaActividades.includes(idActividad)) {
        servicio.ListaActividades.push(idActividad);
      } else {
        servicio.ListaActividades = servicio.ListaActividades.filter((id: string) => id !== idActividad);
      }
    } else {
      let servicioNuevo: ServicioSeleccionado = { idServicio: servicioId, ListaActividades: [idActividad],Costo: 0 }
      serviciosActivos?.push(servicioNuevo);
    }
    setFormState({ ...formState, ServiciosContribuyente: serviciosActivos });
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
      const response = await fetch(`${API_BASE_URL}/clientes/GuardarCliente`, {
        method: Editar ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(`Error: ${data.mensaje}`);
      showNotification(data.mensaje, "success");
      onRegister(data.mensaje, "success", data.data);
    } catch (err: any) {
      console.error('Error al guardar la razón social:', err);
      setError(err.message || 'Hubo un error al guardar la razón social. Verifica que la API esté corriendo y responda correctamente.');
      showNotification("Error al guardar la razón social", "error");
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
        RFC: rfc,
        TipoPersona: rfc.length == 12 ? "Fisica" : "Moral",
        RazonSocial: emisor?.getAttribute("Nombre") ?? "",
        RegimenFiscal: parseInt(emisor?.getAttribute("RegimenFiscal") ?? "0"),
        CodigoPostal: comprobante?.getAttribute("LugarExpedicion") ?? "",
      }));

    };
    reader.readAsText(file);
  };


  const handleActividadToggle = (servicioId: string, actividadId: string, costo: number) => {
    setFormState(prevState => {
      let updatedServices = [...(prevState.ServiciosContribuyente || [])];

      const serviceIndex = updatedServices.findIndex(sc => sc?.idServicio === servicioId);

      if (serviceIndex > -1) {
        let serviceEntry = { ...updatedServices[serviceIndex] };

        let activities = serviceEntry.ListaActividades || [];

        const isSelected = activities.includes(actividadId);

        if (isSelected) {
          activities = activities.filter(id => id !== actividadId);
        } else {
          activities = [...activities, actividadId];
        }

        if (activities.length > 0) {
          updatedServices[serviceIndex] = {
            ...serviceEntry,
            Costo: serviceEntry.Costo || costo, // Mantiene el costo original
            ListaActividades: activities
          };
        } else {
          updatedServices.splice(serviceIndex, 1);
        }

      } else {
        updatedServices.push({
          idServicio: servicioId,
          Costo: costo,
          ListaActividades: [actividadId],
        });
      }

      const cleanServices = updatedServices.filter(Boolean);

      return {
        ...prevState,
        ServiciosContribuyente: cleanServices,
      };
    });
  };

  const handleCostChange = (servicioId: string, value: string) => {
    // Convierte el valor a número, usando 0 si la entrada no es válida
    const newCost = parseFloat(value) || 0;

    setFormState(prevState => {
      let updatedServices = [...(prevState.ServiciosContribuyente || [])];
      const serviceIndex = updatedServices.findIndex(sc => sc?.idServicio === servicioId);

      if (serviceIndex > -1) {
        // 1. El servicio existe: Actualiza solo el costo
        updatedServices[serviceIndex] = {
          ...updatedServices[serviceIndex],
          Costo: newCost,
        };
      } else {
        // 2. El servicio NO existe: Crea una nueva entrada con el costo y actividades vacías.
        // Esto permite al usuario establecer el costo antes de seleccionar actividades.
        updatedServices.push({
          idServicio: servicioId,
          Costo: newCost,
          ListaActividades: [],
        });
      }

      // 3. Limpieza: Si el costo es 0 y no hay actividades, lo ideal sería no tenerlo, 
      // pero lo mantendremos para reflejar el valor del input.
      const cleanServices = updatedServices.filter(Boolean);

      return { ...prevState, ServiciosContribuyente: cleanServices };
    });
  };



  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-blue-900">{Editar ? "Editar Contribuyente" : "Agregar Contribuyente"}</h2>
        <div className="flex-grow mx-2">
          <button onClick={onClose} className="float-right rounded-lg bg-gray-300 px-6 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-400"          >
            Regresar
          </button>
        </div>
        <div className="flex-none">
          {!Editar && (
            <button onClick={AbrirInputXML} className="rounded-lg bg-gray-300 px-6 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-400"          >
              Inportar con XML
            </button>
          )}
          <input ref={inputXMLREF} className='hidden' type="file" accept="text/xml" onChange={importarXML} />
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

      <div className="grid overflow-x-auto rounded-xl bg-white p-6 shadow-md">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 font-bold rounded-t-lg transition-colors duration-200 ease-in-out whitespace-nowrap focus:outline-none
                                ${activeTab === tab.id
                  ? 'text-blue-900 bg-blue-200'
                  : 'text-gray-500 hover:text-blue-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="mt-4">
          {/* Contenido de la pestaña: Información Interna */}
          {activeTab === 'informacion-interna' && (
            <div id="INFORMACION INTERNA" className='mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4'>
              <div className='col-span-1 md:col-span-3'>
                <label className="block text-sm font-medium text-gray-700">Clasificación Comercial</label>
                <input
                  type="text"
                  name="ClasificacionComercial"
                  value={formState.ClasificacionComercial}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className='col-span-1 md:col-span-3'>
                <label className="block text-sm font-medium text-gray-700">Origen / Suborigen</label>
                <input
                  type="text"
                  name="OrigenContacto"
                  value={formState.OrigenContacto}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className='col-span-1 md:col-span-3'>
                <label className="block text-sm font-medium text-gray-700">Recomendado Por</label>
                <input
                  type="text"
                  name="RecomendadoPor"
                  value={formState.RecomendadoPor}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className='col-span-1 md:col-span-3'>
                <label className="block text-sm font-medium text-gray-700">Valor Grupo</label>
                <input
                  type="text"
                  name="ValorGrupo"
                  value={formState.ValorGrupo}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className='col-span-6'>
                <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                <textarea
                  name="Observaciones"
                  value={formState.Observaciones}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Contenido de la pestaña: Contactos de la Empresa */}
          {activeTab === 'contactos-empresa' && (
            <div id="DUENO-EMPRESA" className='mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              <div className="col-span-full">
                <Separador Titulo="Contacto Principal" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <div className='col-span-1'>
                    <label className="block text-sm font-medium text-gray-700">Correo Institucional</label>
                    <input
                      type="text"
                      name="CorreoInstitucional"
                      value={formState.CorreoInstitucional}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className='col-span-1'>
                    <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                    <input
                      type="email"
                      name="CorreoElectronico"
                      value={formState.CorreoElectronico}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className='col-span-1'>
                    <label className="block text-sm font-medium text-gray-700">Número de Contacto</label>
                    <input
                      type="text"
                      name="NumeroTelefono"
                      value={formState.NumeroTelefono}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className='col-span-1'>
                    <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                    <input
                      type="text"
                      name="WhatsApp"
                      value={formState.WhatsApp}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className='col-span-1'>
                    <label className="block text-sm font-medium text-gray-700">Canal de contacto preferente</label>
                    <input
                      type="text"
                      name="CanalPreferente"
                      value={formState.CanalPreferente}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className='col-span-1'>
                    <label className="block text-sm font-medium text-gray-700">Cumpleaños</label>
                    <input
                      type="date"
                      name="Cumpleanos"
                      value={formState.Cumpleanos}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-full">
                <Separador Titulo="Representante Legal" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <div className='col-span-1 md:col-span-2'>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      name="Nombre"
                      value={formState.RepresentanteLegal.Nombre}
                      onChange={(e) => handleNestedInputChange('RepresentanteLegal', e)}
                      className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className='col-span-1'>
                    <label className="block text-sm font-medium text-gray-700">RFC</label>
                    <input
                      type="text"
                      name="RFC"
                      value={formState.RepresentanteLegal.RFC}
                      onChange={(e) => handleNestedInputChange('RepresentanteLegal', e)}
                      className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className='col-span-1'>
                    <label className="block text-sm font-medium text-gray-700">Alias</label>
                    <input
                      type="text"
                      name="Alias"
                      value={formState.RepresentanteLegal.Alias}
                      onChange={(e) => handleNestedInputChange('RepresentanteLegal', e)}
                      className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className='col-span-1'>
                    <label className="block text-sm font-medium text-gray-700">Cumpleaños</label>
                    <input
                      type="date"
                      name="Cumpleanos"
                      value={formState.RepresentanteLegal.Cumpleanos}
                      onChange={(e) => handleNestedInputChange('RepresentanteLegal', e)}
                      className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="col-span-full">
                  <Separador Titulo="Dueño de la empresa" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">

                    <div className='col-span-1'>
                      <label className="block text-sm font-medium text-gray-700">Nombre</label>
                      <input
                        type="text"
                        name="Nombre"
                        value={formState.DuenoEmpresa.Nombre}
                        onChange={(e) => handleNestedInputChange('DuenoEmpresa', e)}
                        className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className='col-span-1'>
                      <label className="block text-sm font-medium text-gray-700">Celular</label>
                      <input
                        type="tel"
                        name="Celular"
                        value={formState.DuenoEmpresa.Telefono} // Usamos 'Telefono' en la interfaz PersonaContacto
                        onChange={(e) => handleNestedInputChange('DuenoEmpresa', e)}
                        className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className='col-span-1'>
                      <label className="block text-sm font-medium text-gray-700">Correo</label>
                      <input
                        type="email"
                        name="Correo"
                        value={formState.DuenoEmpresa.Correo}
                        onChange={(e) => handleNestedInputChange('DuenoEmpresa', e)}
                        className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className='col-span-1'>
                      <label className="block text-sm font-medium text-gray-700">Cumpleaños</label>
                      <input
                        type="date"
                        name="Cumpleanos"
                        value={formState.DuenoEmpresa.Cumpleanos}
                        onChange={(e) => handleNestedInputChange('RepresentanteLegal', e)}
                        className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-span-full">
                  <Separador Titulo="Contacto de Cobranza" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    <div className='col-span-1'>
                      <label className="block text-sm font-medium text-gray-700">Nombre</label>
                      <input
                        type="text"
                        name="Nombre"
                        value={formState.ContactoCobranza.Nombre}
                        onChange={(e) => handleNestedInputChange('ContactoCobranza', e)}
                        className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className='col-span-1'>
                      <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <input
                        type="tel"
                        name="Telefono"
                        value={formState.ContactoCobranza.Telefono}
                        onChange={(e) => handleNestedInputChange('ContactoCobranza', e)}
                        className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className='col-span-1'>
                      <label className="block text-sm font-medium text-gray-700">Correo</label>
                      <input
                        type="email"
                        name="Correo"
                        value={formState.ContactoCobranza.Correo}
                        onChange={(e) => handleNestedInputChange('ContactoCobranza', e)}
                        className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className='col-span-1'>
                      <label className="block text-sm font-medium text-gray-700">Cumpleaños</label>
                      <input
                        type="date"
                        name="Cumpleanos"
                        value={formState.ContactoCobranza.Cumpleanos}
                        onChange={(e) => handleNestedInputChange('ContactoCobranza', e)}
                        className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-span-full">
                  <Separador Titulo="Gerente Operativo" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    <div className='col-span-1'>
                      <label className="block text-sm font-medium text-gray-700">Nombre</label>
                      <input
                        type="text"
                        name="Nombre"
                        value={formState.GerenteOperativo.Nombre}
                        onChange={(e) => handleNestedInputChange('GerenteOperativo', e)}
                        className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className='col-span-1'>
                      <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <input
                        type="tel"
                        name="Telefono"
                        value={formState.GerenteOperativo.Telefono}
                        onChange={(e) => handleNestedInputChange('GerenteOperativo', e)}
                        className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className='col-span-1'>
                      <label className="block text-sm font-medium text-gray-700">Correo</label>
                      <input
                        type="email"
                        name="Correo"
                        value={formState.GerenteOperativo.Correo}
                        onChange={(e) => handleNestedInputChange('GerenteOperativo', e)}
                        className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Contenido de la pestaña: Enlace AKHA */}
          {activeTab === 'enlace-akha' && (
            <div id="ENLACE-AKHA" className='mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              <div className='col-span-1'>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  name="Nombre"
                  value={formState.EnlaceAkha.Nombre}
                  onChange={(e) => handleNestedInputChange('EnlaceAkha', e)}
                  className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className='col-span-1'>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="tel"
                  name="Telefono"
                  value={formState.EnlaceAkha.Telefono}
                  onChange={(e) => handleNestedInputChange('EnlaceAkha', e)}
                  className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className='col-span-1'>
                <label className="block text-sm font-medium text-gray-700">Correo</label>
                <input
                  type="email"
                  name="Correo"
                  value={formState.EnlaceAkha.Correo}
                  onChange={(e) => handleNestedInputChange('EnlaceAkha', e)}
                  className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Contenido de la pestaña: Servicios */}
          {activeTab === 'servicios' && (
            <div id="Servicios" className='mt-4'>

              <div className="w-full">
                {/* Componente Separador asumido */}
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Seleccione los servicios y actividades</h2>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-6">
                {servicios.length === 0 ? (
                  <p className="col-span-full text-center text-gray-500">
                    No hay servicios disponibles.
                  </p>
                ) : (
                  servicios.map((servicio) => {

                    // Obtiene el objeto ServicioContribuyente de la DB si existe
                    const servicioDB = formState.ServiciosContribuyente?.find(
                      (sc) => sc?.idServicio === servicio._id
                    );

                    // 1. Determina si el servicio está seleccionado (ESTADO DEL ACORDEÓN)
                    const isServicioExpanded = formState.ServiciosSeleccionados.includes(servicio._id);

                    // 2. Determina si *alguna* actividad de este servicio está seleccionada (ESTADO de SELECCIÓN PERSISTENTE)
                    // Consultamos el objeto de la DB. Si existe, significa que está seleccionado.
                    const isAnyActivitySelectedInService = !!servicioDB; // Es true si se encuentra el objeto

                    // 3. Define el estado visual general de 'Activo' para el encabezado y el borde
                    const isVisuallyActive = isServicioExpanded || isAnyActivitySelectedInService;

                    const currentCost = servicioDB?.Costo || 0;


                    // Función de ayuda para formatear el costo (asumiendo que servicio.Costo existe)
                    const formattedCost = new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(servicio.Costo || 0);

                    return (
                      <div
                        key={servicio._id}
                        className={`rounded-xl shadow-lg transition-all duration-300 overflow-hidden 
                                ${isVisuallyActive ? 'border-2 border-blue-500 bg-blue-50/50' : 'border border-gray-200 bg-white hover:shadow-xl'}
                            `}
                      >
                        {/* HEADER DEL SERVICIO */}
                        <div
                          className={`p-5 flex flex-col md:flex-row items-start md:items-center justify-between transition-colors duration-200 
                                            ${isVisuallyActive ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
                        >
                          <div className="flex items-center space-x-4 flex-grow min-w-0 mb-3 md:mb-0">
                            {/* Indicador de Selección */}
                            <span
                              onClick={() => handleServicioSelect(servicio._id)}
                              className={`h-5 w-5 rounded-full border-2 flex-shrink-0 transition-colors cursor-pointer
                                                    ${isVisuallyActive ? 'bg-blue-600 border-blue-700' : 'bg-white border-gray-400'}`}
                            ></span>

                            <div className='min-w-0'>
                              <h3 className="text-xl font-bold text-gray-800 truncate">
                                {servicio.Nombre}
                              </h3>
                            </div>
                          </div>

                          {/* CAMPO DE COSTO PERSONALIZADO */}
                          <div className="flex items-center space-x-4 flex-shrink-0 w-full md:w-auto">
                            <div className="relative flex items-center">
                              <span className="text-gray-600 font-semibold mr-2">$</span>
                              <input
                                type="number"
                                value={currentCost}
                                onChange={(e) => handleCostChange(servicio._id, e.target.value)}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className={`w-32 p-2 border-2 rounded-lg text-lg font-bold text-center transition-colors focus:ring-2 focus:ring-blue-500
                                                        ${currentCost > 0 ? 'border-green-400 bg-white' : 'border-gray-300 bg-gray-100'}
                                                    `}
                              />
                            </div>

                            {/* Icono de acordeón (Clickable) */}
                            <span
                              onClick={() => handleServicioSelect(servicio._id)}
                              className="text-gray-500 hover:text-gray-700 transition-transform duration-300 ml-4 cursor-pointer"
                            >
                              {isServicioExpanded ? '▲' : '▼'}
                            </span>
                          </div>
                        </div>

                        {/* CONTENIDO (ACTIVIDADES) - Solo visible si el servicio está expandido (isServicioExpanded) */}
                        {isServicioExpanded && servicio.ActividadesDetalle && servicio.ActividadesDetalle.length > 0 && (
                          <div className="p-5 pt-0 bg-white/70 border-t border-gray-200">
                            <p className="text-sm text-gray-600 font-medium mb-3">Actividades incluidas:</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {servicio.ActividadesDetalle
                                .sort((a, b) => {
                                  const orderA = servicio.ActividadesServicio.find(as => as.idActividad === a._id)?.orden || Infinity;
                                  const orderB = servicio.ActividadesServicio.find(as => as.idActividad === b._id)?.orden || Infinity;
                                  return orderA - orderB;
                                })
                                .map((actividad) => {
                                  const isActividadSelected = servicioDB?.ListaActividades?.includes(actividad._id) || false;

                                  return (
                                    <div
                                      key={actividad._id}
                                      // Le pasamos el costo del servicio a la función de toggle (asumiendo que es el costo por servicio completo)
                                      onClick={() => handleActividadToggle(servicio._id, actividad._id, servicio.Costo)}
                                      className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-all duration-150 ${isActividadSelected ? 'bg-blue-100/80' : 'bg-gray-50 hover:bg-gray-100'}`}
                                    >
                                      <div className="flex items-center space-x-2">
                                        {/* Checkbox visual para la actividad */}
                                        <input
                                          type="checkbox"
                                          checked={isActividadSelected}
                                          onChange={() => handleServicioContribuyenteSelect(servicio._id, actividad._id)} // Se maneja con el onClick del div padre
                                          className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300"
                                        />
                                        <span className="text-base font-medium text-gray-700 break-words flex-grow min-w-0">
                                          {actividad.nombre}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                        {/* Mensaje si no hay actividades, pero el servicio sí tiene detalles */}
                        {isServicioExpanded && servicio.ActividadesDetalle && servicio.ActividadesDetalle.length === 0 && (
                          <div className="p-5 pt-0 bg-white/70 border-t border-gray-200">
                            <p className="text-sm text-gray-500 italic">Este servicio no tiene actividades configuradas.</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>


            </div>

          )}


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

export default ContribuyentesAgregar;