
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Importa el hook useRouter
import Cargando from '@/src/hooks/Cargando';
import { useNotification } from '@/src/hooks/useNotifications';
import { Actividad, Cliente, Credencial, PersonaContacto, RepresentanteLegal } from '@/src/Interfaces/Interfaces';
import { API_BASE_URL, ObtenerSesionUsuario } from '@/src/utils/constantes';


// Definimos una interfaz para las propiedades del modal de registro
interface ModalProps {
  idEditar?: string;
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
const CredencialesCliente = ({ idEditar, onClose, onRegister }: ModalProps) => {
  const sesion = ObtenerSesionUsuario();
  const router = useRouter();
  const { notification, showNotification, hideNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [Editar, setEditar] = useState(false);
  const [MostrarContrasenas, setMostrarContrasenas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para el formulario con los nuevos campos inicializados
  const [formState, setFormState] = useState<Credencial>({
    idCliente: "",
    clavesSAT: {
      archivoCer: "",
      archivoKey: "",
      contrasenaFirma: "",
      fechaCaducidad: new Date(),
      fechaCaducidadSello: new Date(),
    },
    clavesIDSE: {
      rfc: "",
      archivoKey: "",
      archivoCer: "",
      contrasenaFiel: "",
      fechaCaducidad: new Date(),
    },
    clavesSIPARE: {
      registroPatronal: "",
      contrasena: "",
      fechaCaducidad: new Date(),
    },
    clavesISN: {
      rfc: "",
      contrasena: "",
      fechaCaducidad: new Date(),
      codigoEstado: "",
    },
  });



  useEffect(() => {
    if (idEditar) {
      setFormState(prev => ({ ...prev, idCliente: idEditar }));
      ObtenerCredenciales();
    }
  }, []);

  const ObtenerCredenciales = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/credenciales/ObtenerCredenciales/${idEditar}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(`Error: ${data.mensaje}`);
      if (data.data) {
        data.data.clavesSAT.fechaCaducidad = new Date(data.data.clavesSAT.fechaCaducidad);
        data.data.clavesSAT.fechaCaducidadSello = new Date(data.data.clavesSAT.fechaCaducidadSello);
        data.data.clavesIDSE.fechaCaducidad = new Date(data.data.clavesIDSE.fechaCaducidad);
        data.data.clavesSIPARE.fechaCaducidad = new Date(data.data.clavesSIPARE.fechaCaducidad);
        data.data.clavesISN.fechaCaducidad = new Date(data.data.clavesISN.fechaCaducidad);
        setFormState(data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Hubo un error guardar las credenciales. Verifica que la API esté corriendo y responda correctamente.');
      showNotification("Error al guardar las credenciales", "error");
    } finally {
      setIsLoading(false);
    }
  };


  const validarDatos = () => {
    let valido = true;
    // Validaciones existentes
    if (!formState.idCliente) {
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
      const response = await fetch(`${API_BASE_URL}/credenciales/GuardarCredenciales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(`Error: ${data.mensaje}`);
      showNotification("Credenciales guardadas exitosamente", "success");
      onClose();
    } catch (err: any) {
      setError(err.message || 'Hubo un error guardar las credenciales. Verifica que la API esté corriendo y responda correctamente.');
      showNotification("Error al guardar las credenciales", "error");
    } finally {
      setIsLoading(false);
    }
  };
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, claveType: 'clavesSAT' | 'clavesIDSE') => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      try {
        const base64String = await fileToBase64(file);
        setFormState(prev => ({
          ...prev,
          [claveType]: {
            ...prev[claveType],
            [name]: base64String,
            // [`${name}FileName`]: file.name,
          },
        }));
      } catch (error) {
        console.error("Error al convertir el archivo a Base64:", error);
        showNotification("Error al cargar el archivo.", "error");
      }
    }
  };

  const handleSatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      handleFileChange(e, 'clavesSAT');
      return;
    }
    switch (name) {
      case "fechaCaducidad":
        setFormState(prev => ({
          ...prev,
          clavesSAT: {
            ...prev.clavesSAT,
            [name]: new Date(value),
          },
        }));
        return;
      case "fechaCaducidadSello":
        setFormState(prev => ({
          ...prev,
          clavesSAT: {
            ...prev.clavesSAT,
            [name]: new Date(value),
          },
        }));
        return;
      default:
        setFormState(prev => ({
          ...prev,
          clavesSAT: {
            ...prev.clavesSAT,
            [name]: value,
          },
        }));
        return;
    }
  };
  const handleIdseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      handleFileChange(e, 'clavesIDSE');
      return;
    }

    switch (name) {
      case "fechaCaducidad":
        setFormState(prev => ({
          ...prev,
          clavesIDSE: {
            ...prev.clavesIDSE,
            [name]: new Date(value),
          },
        }));
        return;
      default:
        setFormState(prev => ({
          ...prev,
          clavesIDSE: {
            ...prev.clavesIDSE,
            [name]: value,
          },
        }));
        return;
    }
  };
  const handleIsnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case "fechaCaducidad":
        setFormState(prev => ({
          ...prev,
          clavesISN: {
            ...prev.clavesISN,
            [name]: new Date(value),
          },
        }));
        return;
      default:
        setFormState(prev => ({
          ...prev,
          clavesISN: {
            ...prev.clavesISN,
            [name]: value,
          },
        }));
        return;
    }
  };
  const handleSipareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case "fechaCaducidad":
        setFormState(prev => ({
          ...prev,
          clavesSIPARE: {
            ...prev.clavesSIPARE,
            [name]: new Date(value),
          },
        }));
        return;
      default:
        setFormState(prev => ({
          ...prev,
          clavesSIPARE: {
            ...prev.clavesSIPARE,
            [name]: value,
          },
        }));
        return;
    }
  };
  const handleDownload = (base64String: string | undefined, fileName: string | undefined) => {
    if (base64String && fileName) {
      const link = document.createElement('a');
      link.href = base64String;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      showNotification("No hay archivo para descargar.", "warning");
    }
  };
  const EliminarClave = (NombreArchivo: string, claveType: 'clavesSAT' | 'clavesIDSE') => {
    setFormState(prev => ({
      ...prev,
      [claveType]: {
        ...prev[claveType],
        [NombreArchivo]: '',
      },
    }));
  }

  console.log(formState)

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-blue-900">Credenciales del contribuyente</h2>
        <div className="flex-grow mx-2">
          <button onClick={onClose} className="float-right rounded-lg bg-gray-300 px-6 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-400"          >
            Regresar
          </button>
        </div>
      </div>

      <Separador Titulo="Claves SAT" />
      <div className='grid grid-cols-5 gap-4'>
        <div className='col-span-1'>
          <label className="block text-sm font-medium text-gray-700">Archivo .Cer</label>
          <div className='flex'>
            {!formState.clavesSAT.archivoCer && (
              <input
                type="file"
                name="archivoCer"
                onChange={handleSatChange}
                className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
            )}
            {formState.clavesSAT.archivoCer && (
              <button className="w-full mt-1 inline-block rounded-md bg-blue-500 px-4 py-1 text-white transition-colors duration-200 hover:bg-blue-600"
                onClick={() => handleDownload(formState.clavesSAT.archivoCer, 'SAT.cer')}            >
                <i className="material-symbols-rounded filled">download</i> </button>
            )}
            {formState.clavesSAT.archivoCer && (
              <button className="mt-1 inline-block rounded-md bg-red-500 px-4 py-1 text-white transition-colors duration-200 hover:bg-red-600"
                onClick={() => EliminarClave('archivoCer', 'clavesSAT')} >
                <i className="material-symbols-rounded filled">delete</i>  </button>
            )}
          </div>
        </div>
        <div className='col-span-1 '>
          <label className="block text-sm font-medium text-gray-700">Archivo .Key</label>
          <div className='flex'>
            {!formState.clavesSAT.archivoKey && (
              <input
                type="file"
                name="archivoKey"
                onChange={handleSatChange}
                className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
            )}
            {formState.clavesSAT.archivoKey && (
              <button className="w-full mt-1 inline-block rounded-md bg-blue-500 px-4 py-1 text-white transition-colors duration-200 hover:bg-blue-600"
                onClick={() => handleDownload(formState.clavesSAT.archivoKey, 'SAT.key')} >
                <i className="material-symbols-rounded filled">download</i>  </button>
            )}
            {formState.clavesSAT.archivoKey && (
              <button className="mt-1 inline-block rounded-md bg-red-500 px-4 py-1 text-white transition-colors duration-200 hover:bg-red-600"
                onClick={() => EliminarClave('archivoKey', 'clavesSAT')} >
                <i className="material-symbols-rounded filled">delete</i> </button>
            )}
          </div>
        </div>
        <div className='col-span-2'>
          <label className="block text-sm font-medium text-gray-700">Contraseña Firma</label>

          <div className='flex'>
            <input
              type={MostrarContrasenas ? 'text' : 'password'}
              name="contrasenaFirma"
              value={formState.clavesSAT.contrasenaFirma}
              onChange={handleSatChange}
              required
              className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
            <button className="mt-1 inline-block rounded-md bg-gray-300 px-4 py-1 text-gray-800 transition-colors duration-200 hover:bg-gray-400"
              type="button" onClick={() => setMostrarContrasenas(!MostrarContrasenas)} >
              <i className="material-symbols-rounded filled">{MostrarContrasenas ? 'visibility' : 'visibility_off'}</i>
            </button>
          </div>
        </div>
        <div className='col-span-1'>
          <label className="block text-sm font-medium text-gray-700">Fecha de Caducidad SAT</label>
          <input
            type="date"
            name="fechaCaducidad"
            value={formState.clavesSAT.fechaCaducidad ? formState.clavesSAT.fechaCaducidad.toISOString().split("T")[0] : ''}
            onChange={handleSatChange}
            required
            className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className='col-span-1'>
          <label className="block text-sm font-medium text-gray-700">Fecha de Caducidad del sello</label>
          <input
            type="date"
            name="fechaCaducidadSello"
            value={formState.clavesSAT.fechaCaducidadSello ? formState.clavesSAT.fechaCaducidadSello.toISOString().split("T")[0] : ''}
            onChange={handleSatChange}
            required
            className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <Separador Titulo="Claves IDSE" />
      <div className='grid grid-cols-5 gap-4'>
        <div className='col-span-2'>
          <label className="block text-sm font-medium text-gray-700">RFC IDSE</label>
          <input
            type="text"
            name="rfc"
            value={formState.clavesIDSE.rfc}
            onChange={handleIdseChange}
            required
            className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className='col-span-2'>
          <label className="block text-sm font-medium text-gray-700">Contraseña Fiel IDSE</label>
          <div className='flex'>
            <input
              type={MostrarContrasenas ? 'text' : 'password'}
              name="contrasenaFiel"
              value={formState.clavesIDSE.contrasenaFiel}
              onChange={handleIdseChange}
              required
              className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
            <button className="mt-1 inline-block rounded-md bg-gray-300 px-4 py-1 text-gray-800 transition-colors duration-200 hover:bg-gray-400"
              type="button" onClick={() => setMostrarContrasenas(!MostrarContrasenas)} >
              <i className="material-symbols-rounded filled">{MostrarContrasenas ? 'visibility' : 'visibility_off'}</i>
            </button>
          </div>
        </div>
        <div className='col-span-1'>
          <label className="block text-sm font-medium text-gray-700">Archivo .Cer IDSE</label>
          <div className='flex'>
            {!formState.clavesIDSE.archivoCer && (
              <input
                type="file"
                name="archivoCer"
                onChange={handleIdseChange}
                className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
            )}
            {formState.clavesIDSE.archivoCer && (
              <button className="w-full mt-1 inline-block rounded-md bg-blue-500 px-4 py-1 text-white transition-colors duration-200 hover:bg-blue-600"
                onClick={() => handleDownload(formState.clavesIDSE.archivoCer, 'IDSE.cer')} >
                <i className="material-symbols-rounded filled">download</i>  </button>
            )}
            {formState.clavesIDSE.archivoCer && (
              <button className="mt-1 inline-block rounded-md bg-red-500 px-4 py-1 text-white transition-colors duration-200 hover:bg-red-600"
                onClick={() => EliminarClave('archivoCer', 'clavesIDSE')} >
                <i className="material-symbols-rounded filled">delete</i> </button>
            )}
          </div>
        </div>
        <div className='col-span-1'>
          <label className="block text-sm font-medium text-gray-700">Archivo .Key IDSE</label>
          <div className='flex'>
            {!formState.clavesIDSE.archivoKey && (
              <input
                type="file"
                name="archivoKey"
                onChange={handleIdseChange}
                className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
            )}
            {formState.clavesIDSE.archivoKey && (
              <button className="w-full mt-1 inline-block rounded-md bg-blue-500 px-4 py-1 text-white transition-colors duration-200 hover:bg-blue-600"
                onClick={() => handleDownload(formState.clavesIDSE.archivoKey, 'IDSE.key')} >
                <i className="material-symbols-rounded filled">download</i>  </button>
            )}
            {formState.clavesIDSE.archivoKey && (
              <button className="mt-1 inline-block rounded-md bg-red-500 px-4 py-1 text-white transition-colors duration-200 hover:bg-red-600"
                onClick={() => EliminarClave('archivoKey', 'clavesIDSE')} >
                <i className="material-symbols-rounded filled">delete</i> </button>
            )}
          </div>
        </div>
        <div className='col-span-1'>
          <label className="block text-sm font-medium text-gray-700">Fecha de Caducidad IDSE</label>
          <input
            type="date"
            name="fechaCaducidad"
            value={formState.clavesIDSE.fechaCaducidad ? formState.clavesIDSE.fechaCaducidad.toISOString().split("T")[0] : ''}
            onChange={handleIdseChange}
            required
            className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <Separador Titulo="Claves SIPARE" />
      <div className='grid grid-cols-4 gap-4'>
        <div className='col-span-2'>
          <label className="block text-sm font-medium text-gray-700">Registro Patronal SIPARE</label>
          <input
            type="text"
            name="registroPatronal"
            value={formState.clavesSIPARE.registroPatronal}
            onChange={handleSipareChange}
            required
            className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className='col-span-2'>
          <label className="block text-sm font-medium text-gray-700">Contraseña SIPARE</label>
          <div className='flex'>
            <input
              type={MostrarContrasenas ? 'text' : 'password'}
              name="contrasena"
              value={formState.clavesSIPARE.contrasena}
              onChange={handleSipareChange}
              required
              className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
            <button className="mt-1 inline-block rounded-md bg-gray-300 px-4 py-1 text-gray-800 transition-colors duration-200 hover:bg-gray-400"
              type="button" onClick={() => setMostrarContrasenas(!MostrarContrasenas)} >
              <i className="material-symbols-rounded filled">{MostrarContrasenas ? 'visibility' : 'visibility_off'}</i>
            </button>
          </div>
        </div>
        <div className='col-span-1'>
          <label className="block text-sm font-medium text-gray-700">Fecha de Caducidad SIPARE</label>
          <input
            type="date"
            name="fechaCaducidad"
            value={formState.clavesSIPARE.fechaCaducidad ? formState.clavesSIPARE.fechaCaducidad.toISOString().split("T")[0] : ''}
            onChange={handleSipareChange}
            required
            className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <Separador Titulo="Claves ISN" />
      <div className='grid grid-cols-4 gap-4'>
        <div className='col-span-2'>
          <label className="block text-sm font-medium text-gray-700">RFC ISN</label>
          <input
            type="text"
            name="rfc"
            value={formState.clavesISN.rfc}
            onChange={handleIsnChange}
            required
            className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className='col-span-2'>
          <label className="block text-sm font-medium text-gray-700">Contraseña ISN</label>
          <div className='flex'>
            <input
              type={MostrarContrasenas ? 'text' : 'password'}
              name="contrasena"
              value={formState.clavesISN.contrasena}
              onChange={handleIsnChange}
              required
              className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
            <button className="mt-1 inline-block rounded-md bg-gray-300 px-4 py-1 text-gray-800 transition-colors duration-200 hover:bg-gray-400"
              type="button" onClick={() => setMostrarContrasenas(!MostrarContrasenas)} >
              <i className="material-symbols-rounded filled">{MostrarContrasenas ? 'visibility' : 'visibility_off'}</i>
            </button>
          </div>
        </div>
        <div className='col-span-1'>
          <label className="block text-sm font-medium text-gray-700">Código Estado ISN</label>
          <input
            type="text"
            name="codigoEstado"
            value={formState.clavesISN.codigoEstado}
            onChange={handleIsnChange}
            required
            className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className='col-span-1'>
          <label className="block text-sm font-medium text-gray-700">Fecha de Caducidad ISN</label>
          <input
            type="date"
            name="fechaCaducidad"
            value={formState.clavesISN.fechaCaducidad ? formState.clavesISN.fechaCaducidad.toISOString().split("T")[0] : ''}
            onChange={handleIsnChange}
            required
            className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className='flex justify-end mt-6'>
        <button
          onClick={Guardar}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors duration-200 hover:bg-blue-700"
        >
          Guardar
        </button>
      </div>

      {isLoading && <Cargando isLoading={isLoading} />}
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

export default CredencialesCliente;