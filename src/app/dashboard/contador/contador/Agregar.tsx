
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Importa el hook useRouter
import ToggleSwitch from "@/src/hooks/ToggleSwitch";
import Cargando from '@/src/hooks/Cargando';
import { useNotification } from '@/src/hooks/useNotifications';
import { Actividad, Cliente,  ServicioItem, RepresentanteLegal } from '@/src/Interfaces/Interfaces';
import { ObtenerSesionUsuario } from '@/src/utils/constantes';



// Definición de interfaces para los nuevos campos





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
}

// Componente para la vista de CRUD de Usuarios
const ContribuyenteConsultar = ({ idEditar, Editar = false, onClose, onRegister }: ModalProps) => {
  const sesion = ObtenerSesionUsuario();
  const router = useRouter();
  const { notification, showNotification, hideNotification } = useNotification();

  // Estado para el formulario con los nuevos campos inicializados
  const [formState, setFormState] = useState<Cliente>({
    Estado: 0,
    RazonSocial: "",
    Cumpleanos: "",
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
    idUsuarioCreacion: "",
    idGrupoEmpresarial: "",
    idContador: "",
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
      Correo: ""
    },
    ContactoCobranza: {
      Nombre: "",
      Telefono: "",
      Correo: ""
    },
    GerenteOperativo: {
      Nombre: "",
      Telefono: "",
      Correo: ""
    },
    EnlaceAkha: {
      Nombre: "",
      Telefono: "",
      Correo: ""
    }
  });

  const [regimenfiscales, setregimenfiscales] = useState<RegimenFiscal[]>([]);
  const [servicios, setservicios] = useState<ServicioItem[]>([]);
  const [ServiciosSeleccionados, setSelectedServicios] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inputXMLREF = useRef<HTMLInputElement | null>(null);

  // Nuevo estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState('servicios');

  // Definimos las pestañas en un arreglo para que sea más escalable
  const tabs = [
    { id: 'servicios', label: 'Servicios' },
    { id: 'informacion-interna', label: 'Información Interna' },
    { id: 'contactos-empresa', label: 'Contactos de la Empresa' },
    { id: 'enlace-akha', label: 'Enlace' },
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

  const listarServicios = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Servicios/ObtenerListadoPorCliente/${idEditar}`);
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'La respuesta de la API de servicios no es un array válido.');
      }
      console.log('servicios:', result.data);
      if(result.data){
        UnidicarActividadesServicio(result.data);
      }
    } catch (err: any) {
      console.error('Error al cargar los servicios:', err);
      showNotification('Error al cargar los servicios.', 'error');
    }
  };
  const UnidicarActividadesServicio = (listarServicios: ServicioItem[]) => {
    for (const servicio of listarServicios) {
      for (const actividad of servicio.Actividades) {
        let index = servicio.ActividadesServicio.findIndex((item) => item.idActividad === actividad._id);
        if (index >= 0) {
          actividad.Orden = servicio.ActividadesServicio[index].Orden;
        }
      }
      servicio.Actividades = servicio.Actividades.sort((a, b) => (a.Orden || 0) - (b.Orden || 0))
    }

    setservicios(listarServicios);
  }

  // Función para manejar cambios en campos anidados (Representante Legal, Dueño, etc.)
  const handleNestedInputChange = (section: keyof Cliente, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  // Lógica para manejar la selección/deselección de servicios y actualizar formState
  const handleServicioSelect = (servicioId: string) => {
    setFormState(prevFormState => {
      const currentSelected = prevFormState.ServiciosSeleccionados;
      let newSelected;
      if (currentSelected.includes(servicioId)) {
        // Deseleccionar el servicio
        newSelected = currentSelected.filter(id => id !== servicioId);
      } else {
        // Seleccionar el servicio
        newSelected = [...currentSelected, servicioId];
      }

      // Devolver un nuevo estado de formState con la lista de servicios actualizada
      return {
        ...prevFormState,
        ServiciosSeleccionados: newSelected
      };
    });
  };


  const validarDatos = () => {
    let valido = true;
    // Validaciones existentes
    if (!formState.RazonSocial || !formState.RFC || !formState.CodigoPostal || !formState.Direccion || !formState.RegimenFiscal || !formState.TipoPersona) {
      showNotification("Por favor, complete todos los campos marcados con", "error");
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
      showNotification("Razón Social guardada exitosamente", "success");
      onClose();
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

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-blue-900">Consultar Contribuyente</h2>
        <div className="flex-grow mx-2">
          <button onClick={onClose} className="float-right rounded-lg bg-gray-300 px-6 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-400"          >
            Regresar
          </button>
        </div>
      </div>

      <Separador Titulo="Información General" />
      <div id="INFORMACION GENERAL" className='grid grid-cols-5 gap-4'>
        <div className='col-span-2'>
          <label className="block text-sm font-medium text-gray-700">Razón Social</label>
          <input
            disabled
            type="text"
            name="RazonSocial"
            value={formState.RazonSocial}
            onChange={handleInputChange}
            required
            className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className='col-span-1'>
          <label className="block text-sm font-medium text-gray-700">Código Postal</label>
          <input
            disabled
            type="number"
            name="CodigoPostal"
            value={formState.CodigoPostal}
            onChange={handleInputChange}
            required
            className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className='col-span-1'>
          <label className="block text-sm font-medium text-gray-700">RFC</label>
          <input
            disabled
            type="text"
            name="RFC"
            value={formState.RFC}
            onChange={handleInputChange}
            required
            className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className='col-span-2'>
          <label className="block text-sm font-medium text-gray-700">Tipo de Persona</label>
          <select
            disabled
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
          <label className="block text-sm font-medium text-gray-700">Regimen Fiscal</label>
          <select
            disabled
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
          <label className="block text-sm font-medium text-gray-700">Dirección</label>
          <textarea
            disabled
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
                  disabled
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
                  disabled
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
                  disabled
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
                  disabled
                  type="text"
                  name="ValorGrupo"
                  value={formState.ValorGrupo}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div id="OBSERVACIONES" className='mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
                <div className='col-span-1 md:col-span-2 lg:col-span-5'>
                  <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                  <textarea
                    disabled
                    name="Observaciones"
                    value={formState.Observaciones}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
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
                      disabled
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
                      disabled
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
                      disabled
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
                      disabled
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
                      disabled
                      type="text"
                      name="CanalPreferente"
                      value={formState.CanalPreferente}
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
                      disabled
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
                      disabled
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
                      disabled
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
                      disabled
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
                        disabled
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
                        disabled
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
                        disabled
                        type="email"
                        name="Correo"
                        value={formState.DuenoEmpresa.Correo}
                        onChange={(e) => handleNestedInputChange('DuenoEmpresa', e)}
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
                        disabled
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
                        disabled
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
                        disabled
                        type="email"
                        name="Correo"
                        value={formState.ContactoCobranza.Correo}
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
                        disabled
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
                        disabled
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
                        disabled
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
                  disabled
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
                  disabled
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
                  disabled
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
              <Separador Titulo="Seleccione los servicios" />
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2  gap-6">
                {servicios.length === 0 && (
                  <p className="col-span-full text-center text-gray-500">
                    No hay servicios disponibles.
                  </p>
                ) }
                {
                  servicios.map((servicio) => (
                    <div
                      key={servicio._id}
                      className={`p-4 rounded-md cursor-pointer transition-all duration-200 relative bg-white border-2 border-gray-300 hover:border-blue-300`}
                    >
                      <div className="grid grid-cols-1 items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {servicio.Nombre}
                        </h3>

                        {servicio.Actividades.map((actividad) => (
                          <h4 key={actividad._id} className="text-sm text-gray-500 mt-1">
                            {actividad.Orden} - {actividad.nombre}
                          </h4>
                        ))}
                      </div>
                    </div>
                  ))
                }
              </div>


            </div>

          )}


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

export default ContribuyenteConsultar;