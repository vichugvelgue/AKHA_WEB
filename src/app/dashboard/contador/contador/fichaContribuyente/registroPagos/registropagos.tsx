import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/src/utils/constantes";
import { ObtenerSesionUsuario } from '@/src/utils/constantes';
import { TipoRegistroPago } from "@/src/Interfaces/enums";
import { useNotification } from "@/src/hooks/useNotifications";
import MensajeNotificacion from "@/src/hooks/MensajeNotificacion";

// Nueva interfaz para la estructura de los datos a enviar.
interface RegistroPagoData {
  idCliente: string;
  idUsuarioRegistro: string;
  NombreArhivo: string;
  ExtencionArchivo: string;
  Tipo:TipoRegistroPago;
  FechaPago: Date;
  PeriodoFiscal: Date;
  FechaRegistro: Date;
  ArchivoBase64: string;
}

// Interfaz para la respuesta del historial de pagos
interface HistorialPago {
  _id: string;
  idCliente: string;
  idUsuarioRegistro: string;
  NombreArhivo: string;
  ExtencionArchivo: string;
  Tipo:TipoRegistroPago;
  FechaPago: string; // Se reciben como string del backend
  PeriodoFiscal: string; // Se reciben como string del backend
  FechaRegistro: string; // Se reciben como string del backend
}

interface RegistroPagosProps {
  Visible: boolean;
  idEditar: string;
  Cerrar: (exito: string) => void;
}

// Función para convertir un archivo a Base64 de forma asíncrona
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const RegistroPagos: React.FC<RegistroPagosProps> = ({ Visible, idEditar = "", Cerrar }) => {
  const { showNotification, hideNotification,notification } = useNotification();
  const session = ObtenerSesionUsuario();
  const [view, setView] = useState<"registro" | "historial">("registro");
  const [pagos, setPagos] = useState<HistorialPago[]>([]);
  const [historialLoading, setHistorialLoading] = useState<boolean>(false);
  const [idCliente, setIdCliente] = useState<string>(idEditar);
  const [tipo, setTipo] = useState<TipoRegistroPago>(TipoRegistroPago.Recibo);

  if (!Visible) return null;

  const [fechaPago, setFechaPago] = useState<string>("");
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [fechaRegistro, setFechaRegistro] = useState<string>("");
  const [periodoActual, setPeriodoActual] = useState<string>("");

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    setFechaRegistro(formattedDate);
    if (idEditar) {
      setIdCliente(idEditar);
    }
    
    // Formato YYYY-MM para el input de tipo 'month'
    const month = now.getMonth();
    const year = now.getFullYear();
    const formattedPeriodo = `${year}-${(month + 1).toString().padStart(2, '0')}`;
    setPeriodoActual(formattedPeriodo);
  }, []);

  // Nuevo useEffect para cargar los datos del historial cuando la vista cambia
  useEffect(() => {
    if (view === "historial" && periodoActual) {
      fetchHistorialPagos();
    }
  }, [view, periodoActual]);

  // Nueva función para obtener el historial de pagos de la API
  const fetchHistorialPagos = async () => {
    setHistorialLoading(true);
    setPagos([]); // Limpiar los datos viejos
    try {
      // Convertir la fecha del string 'YYYY-MM' a un objeto Date del primer día del mes
      const [year, month] = periodoActual.split('-').map(Number);
      const fechaParaBackend = new Date(year, month - 1, 1);

      const respuesta = await fetch(`${API_BASE_URL}/registrospagos/ListadoPorMesCliente`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: "POST", // Usamos POST para enviar el objeto Date
        body: JSON.stringify({
          idCliente: idCliente,
          Mes: fechaParaBackend,
        }),
      });

      const data = await respuesta.json();
    if (respuesta.ok) { 
        const pagosData = data.data || [];
        setPagos(pagosData);
        // showNotification("Historial de pagos cargado.", "success");
      } else {
        showNotification(data.mensaje || "Error al cargar el historial.", "error");
      }
    } catch (error) {
      console.error("Error en la llamada a la API de historial:", error);
      showNotification("Ocurrió un error al cargar el historial.", "error");
    } finally {
      setHistorialLoading(false);
    }
  };

  const handleGuardar = async () => {
    if (!comprobanteFile || !fechaPago) {
      showNotification("Por favor, selecciona una fecha y un archivo de comprobante.", "error");
      return;
    }

    setLoading(true);

    try {
      const archivoBase64 = await fileToBase64(comprobanteFile);
      const fileNameParts = comprobanteFile.name.split('.');
      const fileExtension = fileNameParts.pop() || '';
      const fileName = fileNameParts.join('.');

      // Construir el objeto de datos que coincide con el esquema del backend
      // Se obtienen el año y el mes del periodo fiscal para construir la fecha.
      const [year, month] = periodoActual.split('-').map(Number);
      const periodoFiscalDate = new Date(year, month - 1, 1);

      const datosParaGuardar: RegistroPagoData = {    
        idCliente: idCliente,
        idUsuarioRegistro: session.idUsuario,
        Tipo: tipo,
        NombreArhivo: fileName,
        ExtencionArchivo: fileExtension,
        FechaPago: new Date(fechaPago+"T12:00"),
        // Se usa la fecha construida localmente para evitar problemas de zona horaria.
        PeriodoFiscal: periodoFiscalDate, 
        FechaRegistro: new Date(),
        ArchivoBase64: archivoBase64,
      };

      const respuesta = await fetch(`${API_BASE_URL}/registrospagos/Guardar`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: "POST",
        body: JSON.stringify(datosParaGuardar),
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        showNotification("Registro de pago guardado correctamente.", "success");    
        Cerrar("success");
      } else {
        showNotification(data.mensaje || "Ocurrió un error al guardar.", "error");
      }
    } catch (error) {
      console.error("Error en la llamada a la API:", error);
      showNotification("Ocurrió un error, inténtelo más tarde.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setComprobanteFile(e.target.files[0]);
    } else {
      setComprobanteFile(null);
    }
  };

  const handleToggleView = () => {
    setView(view === "registro" ? "historial" : "registro");
  };

  const handleDownload = (infopago: HistorialPago) => {    
    setDownloadingId(infopago._id);
     const downloadUrl = `${API_BASE_URL}/registrospagos/descargarcomprobante/${infopago._id}/${idCliente}/${infopago.ExtencionArchivo}`;       
    window.location.href = downloadUrl;        
    fetch(downloadUrl, {
        method: 'GET',        
    })
    .then(response => {
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

    const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

  // Vista de registro de pagos (original)
  const RegistroView = () => (
    <>
      <div className="bg-gray-100 p-4 rounded-xl flex justify-between items-center text-sm mb-4">
        <div className="flex flex-col">
          <span className="font-semibold text-gray-700">Período Fiscal:</span>
          <input
            type="month"
            value={periodoActual}
            onChange={(e) => setPeriodoActual(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm sm:text-sm cursor-not-allowed"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-700">Fecha de Registro:</span>
          <span className="text-gray-600 mt-1">{fechaRegistro}</span>
        </div>
      </div>
      <div className="w-full max-w-4xl rounded-2xl bg-gray-100 p-8">
        <div className="grid grid-cols-[auto_1fr] gap-y-4 items-center">
          <div className="p-4">Fecha de pago</div>
          <div className="p-4">
            <input
              type="date"
              name="fechaPago"
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white"
            />
          </div>
          <div className="p-4">Formato</div>
          <div className="p-4">
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoRegistroPago)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white"
            >
              <option value={TipoRegistroPago.Recibo}>Formato de pago</option>
              <option value={TipoRegistroPago.Acuse}>Acuse</option>
            </select>
          </div>
          <div className="p-4">Cargar comprobante</div>
          <div className="p-4">
            <label className="block w-full cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-gray-700 transition-colors hover:bg-gray-200">
              <span className="text-base font-medium">Seleccionar archivo</span>
              <input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {comprobanteFile && (
              <p className="mt-2 text-sm text-gray-500 truncate">{comprobanteFile.name}</p>
            )}
          </div>
        </div>
      </div>
      {loading && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center space-x-2 text-blue-500">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Guardando...</span>
          </div>
        </div>
      )}
      <div className="mt-4 flex justify-end space-x-2">
        <button onClick={() => Cerrar("")} disabled={loading} className="rounded-md bg-gray-300 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-400 disabled:opacity-50">
          Cancelar
        </button>
        <button onClick={handleGuardar} disabled={loading} className="rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50">
          Guardar
        </button>
      </div>
    </>
  );

 // Nueva vista de historial de pagos
  const HistorialView = () => (
    <>
      <div className="w-full max-w-4xl rounded-2xl bg-gray-100 p-8 space-y-4">
        <div className="flex justify-between items-center mb-4">
          
          <input
            type="month"
            value={periodoActual}
            onChange={(e) => setPeriodoActual(e.target.value)}
            className="rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm text-sm"
          />
        </div>
        
        {historialLoading && (
          <div className="flex justify-center py-8">
            <div className="flex items-center space-x-2 text-blue-500">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Cargando historial...</span>
            </div>
          </div>
        )}

        {!historialLoading && pagos.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>No se encontraron pagos para este período.</p>
          </div>
        )}

        {!historialLoading && pagos.length > 0 && (
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden mx-auto">
              
              <div className="overflow-x-auto p-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha de Pago
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Periodo Fiscal
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo de formato
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Archivo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pagos.map((pago) => {
                      const isDownloading = downloadingId === pago._id;
                      return(
                        <tr key={pago._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {new Date(pago.FechaPago).toLocaleDateString('es-MX')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(pago.PeriodoFiscal).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {pago.Tipo.replace(/_/g, " ")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                            <button 
                                                  onClick={() => handleDownload(pago)}
                                                  className={`
                                                      text-xs flex items-center justify-center mx-auto transition-colors px-3 py-1 rounded-lg
                                                      ${isDownloading 
                                                          ? 'bg-blue-100 text-blue-600 cursor-not-allowed'
                                                          : 'bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-800 font-medium'
                                                      }
                                                  `}
                                                  title={`Descargar ${pago.NombreArhivo}`}
                                                  disabled={isDownloading} // Deshabilitar mientras descarga
                                              >                                                  
                                                  {isDownloading ? (
                                                      <>
                                                          <Spinner />
                                                          <span>Descargando...</span>
                                                      </>
                                                  ) : (
                                                      <>
                                                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                          <span className="truncate max-w-[100px] inline-block">{pago.NombreArhivo}</span>
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
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <button onClick={() => Cerrar("")} className="rounded-md bg-gray-300 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-400">
          Cerrar
        </button>
      </div>
    </>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
    >
      <div className="w-full max-w-4xl max-h-[90dvh] overflow-auto rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 scale-100">
        <div className="flex justify-between items-center mb-6">
          <div className="text-2xl font-bold text-blue-900">
            {view === "registro" ? "Registro de acuse y formato de pago" : "Historial de acuse y formato de pago"}
          </div>
          <button
            onClick={handleToggleView}
            className="rounded-md bg-blue-500 px-4 py-2 text-white font-medium transition-colors hover:bg-blue-600"
          >
            {view === "registro" ? "Ver Historial" : "Volver a Registro"}
          </button>
        </div>
        {view === "registro" ? <RegistroView /> : <HistorialView />}
      </div>
      <MensajeNotificacion {...notification} hideNotification={hideNotification}/>
    </div>
  );
};

export default RegistroPagos;
