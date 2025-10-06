import React, { useState, useEffect, useCallback } from 'react';
import { ObtenerSesionUsuario } from '@/src/utils/constantes';
import { useNotification } from "@/src/hooks/useNotifications";
import MensajeNotificacion from "@/src/hooks/MensajeNotificacion";
import { requestToBodyStream } from 'next/dist/server/body-streams';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const sesion = ObtenerSesionUsuario();

// Enumeración de Estatus de Actividad (simulada)
enum EstatusActividad {
  PENDIENTE = 0,
  EN_PROGRESO = 1,
  COMPLETADA = 2,
  DEMORADA = 3,
  CANCELADA = 4,
}

// Interfaces de datos (simuladas)
interface Actividad {
  _id: string;
  Nombre: string;
  FechaInicio: string;
  FechaVencimiento: string;
  TipoOrigen: string;
  EstadoActividad: EstatusActividad;
}

interface IncidenciaCatalogo {
  _id: string;
  Nombre: string;
}

interface IncidenciaRegistrada {
  _id: string;
  idActividad: string;
  idIncidencia: string;
  Motivo: string;
  FechaRegistro: string;
  NombreArchivo: string;  
  TipoIncidenciaNombre: string;
  ExtencionArchivo: string;
}


const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// --- COMPONENTE MODAL DE INCIDENCIAS ---
interface ModalIncidenciasProps {
  idActividad: string;
  actividadNombre: string;
    idContribuyente?: string;
  onClose: () => void;
  onIncidenciaGuardada: () => void;
}

const ModalIncidencias: React.FC<ModalIncidenciasProps> = ({ idActividad, actividadNombre, idContribuyente="", onClose, onIncidenciaGuardada }) => {
    const { notification, showNotification, hideNotification } = useNotification();
  const [catalogo, setCatalogo] = useState<IncidenciaCatalogo[]>([]);
  const [historial, setHistorial] = useState<IncidenciaRegistrada[]>([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);
  const [loadingHistorial, setLoadingHistorial] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [idCliente, setIdCliente] = useState<string>(idContribuyente);
      const [downloadingId, setDownloadingId] = useState<string | null>(null);


  // Estado del formulario de registro
  const [tipoIncidenciaId, setTipoIncidenciaId] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");
  const [evidenciaFile, setEvidenciaFile] = useState<File | null>(null);

   // Obtener el listado de incidencias
  const ObtenerListaIncidencias = useCallback(async () => {
    setLoadingCatalogo(true);
    try {
        const response = await fetch(`${API_BASE_URL}/incidencias/ObternerListadoIncidencias`);
        const result = await response.json();

        if (response.ok && !result.error && Array.isArray(result.data)) {
            // Asignamos la respuesta del API al estado
            setCatalogo(result.data);
            setTipoIncidenciaId(result.data[0]?._id || "");            
        } else {
            console.error("Error API Catálogo:", result.mensaje);            
            setCatalogo([]);
        }
    } catch (error) {
        console.error("Error de conexión Catálogo:", error);
    } finally {
        setLoadingCatalogo(false);
    }
  }, []);

  useEffect(() => {
    if (idActividad) {
      ObtenerListaIncidencias();
      ObtenerListadoIncidenciasActividades();
    }
  }, [idActividad, ObtenerListaIncidencias]);
  
  // Maneja la subida de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Validar extensión
      const validExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'docx'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (!fileExtension || !validExtensions.includes(fileExtension)) {        
        e.target.value = ''; // Limpiar el input
        setEvidenciaFile(null);
        return;
      }
      setEvidenciaFile(file);
    } else {
      setEvidenciaFile(null);
    }
  };

  // Función de descarga simulada
  const handleDownload = (incidencia: IncidenciaRegistrada) => {    
    setDownloadingId(incidencia._id);
     const downloadUrl = `${API_BASE_URL}/incidenciasactividades/descargarcomprobante/${incidencia._id}/${idCliente}/${incidencia.ExtencionArchivo}`;       

    window.location.href = downloadUrl;
        
    fetch(downloadUrl, {
        method: 'GET',        
    })
    .then(response => {
        // El navegador maneja la descarga automáticamente si se usan las cabeceras correctas.
        if (response.status === 200) {
            console.log("El servidor ha respondido correctamente. Descarga iniciada.");
             setDownloadingId(null);
        } else {
            alert("Error al intentar descargar el archivo.");
             setDownloadingId(null);
        }
    })
    .catch(error => console.error("Error de red al intentar descargar:", error));
    
  };

const handleGuardarIncidencia = async () => {    
    if (!tipoIncidenciaId || !motivo || !evidenciaFile) {
      showNotification("Todos los campos (Tipo, Motivo y Evidencia) son obligatorios.", "error");
      return;
    }    
    setIsSaving(true);
    try {        
        const archivoBase64 = await fileToBase64(evidenciaFile);
        const fileNameParts = evidenciaFile.name.split('.');
        const fileExtension = fileNameParts.pop() || '';
        const fileName = fileNameParts.join('.');        
        const fechaRegistro = new Date().toISOString(); 
        const datosParaGuardar = { 
            idActividad: idActividad,
            idIncidencia: tipoIncidenciaId,
            Motivo: motivo,
            idContadorRegistro: sesion.idUsuario, 
            idCliente: idCliente,
            FechaRegistro: fechaRegistro,
            // Datos del archivo
            NombreArchivo: fileName,
            ExtencionArchivo: fileExtension,
            ArchivoBase64: archivoBase64, // Contenido del archivo
        };    
        const respuesta = await fetch(`${API_BASE_URL}/incidenciasactividades/registrar`, {
            headers: { 'Content-Type': 'application/json' },
            method: "POST",
            body: JSON.stringify(datosParaGuardar),
        });
        const data = await respuesta.json();        
        if (respuesta.ok) {
            showNotification("Incidencia registrada con éxito.", "success");
            
            // Resetear formulario
            setMotivo("");
            setEvidenciaFile(null);
                
            // Notificar al componente padre de que ha habido un cambio
            onIncidenciaGuardada(); 
            ObtenerListadoIncidenciasActividades();

        } else {
            showNotification(data.mensaje || "Ocurrió un error al registrar la incidencia.", "error");
        }

    } catch (error) {
      console.error("Error en la llamada a la API:", error);
      showNotification("Ocurrió un error en la comunicación con la API, inténtelo más tarde.", "error");
    } finally {
      setIsSaving(false);
    }
  };

   const ObtenerListadoIncidenciasActividades = useCallback(async () => {
    if (!idActividad) return;
    setLoadingHistorial(true);
    try {
        const url = `${API_BASE_URL}/incidenciasactividades/ObtenerListaPorActividad?idActividad=${idActividad}`;
        const response = await fetch(url);
        const result = await response.json();

        if (response.ok && !result.error && Array.isArray(result.data)) {
            // Asignamos la lista real de incidencias
            setHistorial(result.data); 
        } else {
            console.error("Error API Historial:", result.mensaje);
            showNotification(result.mensaje || "Error al cargar el historial de incidencias.", "error");
            setHistorial([]);
        }
    } catch (error) {
        console.error("Error de conexión Historial:", error);
        showNotification("Error de conexión con el servicio de historial.", "error");
        setHistorial([]);
    } finally {
        setLoadingHistorial(false);
    }
  }, [idActividad]);

  const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity" // Fondo semitransparente con desenfoque
        onClick={onClose}>
        <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95dvh] flex flex-col transition-transform transform scale-100 
                       border-4 border-blue-600" 
            onClick={(e) => e.stopPropagation()}>
          	{/* Encabezado */}
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-blue-700">Gestión de Incidencias</h2>
                <p className="text-sm text-gray-600 mt-1">Actividad: <span className="font-semibold text-gray-800">{actividadNombre}</span></p>
            </div>

            {/* Contenido (Registro + Historial) */}
            <div className="flex-grow overflow-y-auto p-6 space-y-8">
                
                {/* Sección 1: Registro de Nueva Incidencia */}
                <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500 shadow-inner">
                    <h3 className="text-xl font-semibold text-blue-800 mb-4">Registrar Nueva Incidencia</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Tipo de Incidencia (Catálogo) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Incidencia *</label>
                            {loadingCatalogo ? (
                                <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
                            ) : (
                                <select
                                    value={tipoIncidenciaId}
                                    onChange={(e) => setTipoIncidenciaId(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm p-2 text-sm focus:border-blue-500"
                                    disabled={isSaving}
                                >
                                    <option value="" disabled>Seleccione un tipo</option>
                                    {catalogo.map(item => (
                                        <option key={item._id} value={item._id}>{item.Nombre}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        
                        {/* Carga de Evidencia */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Adjuntar Evidencia (PDF, JPG, PNG, DOCX) *</label>
                            <label className="flex items-center space-x-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 cursor-pointer text-sm shadow-sm h-10">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                <span className="truncate">{evidenciaFile ? evidenciaFile.name : 'Seleccionar archivo...'}</span>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.png,.docx"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={isSaving}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Motivo (Texto Libre) */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de la Incidencia *</label>
                        <textarea
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            rows={3}
                            className="w-full rounded-md border-gray-300 shadow-sm p-2 text-sm focus:border-blue-500"
                            placeholder="Describa detalladamente lo que causó la incidencia..."
                            disabled={isSaving}
                        />
                    </div>

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleGuardarIncidencia}
                            disabled={isSaving || !tipoIncidenciaId || !motivo || !evidenciaFile}
                            className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-white font-medium transition-colors hover:bg-red-700 disabled:opacity-50 shadow-md"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Registrando...
                                </>
                            ) : (
                                'Registrar Incidencia'
                            )}
                        </button>
                    </div>
                </div>

                {/* Sección 2: Historial de Incidencias Registradas */}
                <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Historial de Incidencias ({historial.length})</h3>
                    
                    {loadingHistorial && (
                        <div className="text-center text-gray-500 py-4">Cargando historial...</div>
                    )}

                    {!loadingHistorial && historial.length === 0 && (
                        <div className="text-center text-gray-500 py-4 bg-gray-100 rounded-lg">
                            No hay incidencias registradas para esta actividad.
                        </div>
                    )}

                    {!loadingHistorial && historial.length > 0 && (
                        <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
                            <table className='min-w-full divide-y divide-gray-200'>
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incidencia</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Evidencia</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {historial.map((incidencia) => {
                                                    const isDownloading = downloadingId === incidencia._id;

return(
                                        <tr key={incidencia._id} className="hover:bg-red-50/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(incidencia.FechaRegistro).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{incidencia.TipoIncidenciaNombre}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={incidencia.Motivo}>{incidencia.Motivo}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button 
                                                onClick={() => handleDownload(incidencia)}
                                                className={`
                                                    text-xs flex items-center justify-center mx-auto transition-colors px-3 py-1 rounded-lg
                                                    ${isDownloading 
                                                        ? 'bg-blue-100 text-blue-600 cursor-not-allowed'
                                                        : 'bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-800 font-medium'
                                                    }
                                                `}
                                                title={`Descargar ${incidencia.NombreArchivo}`}
                                                disabled={isDownloading} // Deshabilitar mientras descarga
                                            >
                                                {/* LÓGICA CONDICIONAL DE CARGA */}
                                                {isDownloading ? (
                                                    <>
                                                        <Spinner />
                                                        <span>Descargando...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                        <span className="truncate max-w-[100px] inline-block">{incidencia.NombreArchivo}</span>
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        </tr>
);
})}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Pie de página (Botón de Cerrar) */}
            <div className="p-4 border-t border-gray-200 flex justify-end">
                <button
                    onClick={onClose}
                    className="rounded-lg bg-gray-200 px-6 py-2 text-gray-800 font-medium transition-colors hover:bg-gray-300 disabled:opacity-50 shadow-md"
                    disabled={isSaving}
                >
                    Cerrar
                </button>
            </div>
        </div>
        <MensajeNotificacion {...notification} hideNotification={hideNotification} />
    </div>
  );
};

export default ModalIncidencias;
