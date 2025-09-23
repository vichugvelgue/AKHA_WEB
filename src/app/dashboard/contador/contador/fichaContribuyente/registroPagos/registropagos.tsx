import React, { useState, useEffect } from "react";
import { API_BASE_URL,ObtenerSesionUsuario } from "@/src/utils/constantes";

// Nueva interfaz para la estructura de los datos a enviar.
// Es una buena práctica para asegurar que los datos coincidan con el esquema del backend.
interface RegistroPagoData {
  idCliente: string;
  idUsuarioRegistro: string;
  NombreArhivo: string;
  ExtencionArchivo: string;
  FechaPago: Date;
  PeriodoFiscal: Date;
  FechaRegistro: Date;
  ArchivoBase64: string;
}

interface RegistroPagosProps {
  Visible: boolean;
  idEditar: string;
  Cerrar: (exito: string) => void;
}

// Función para simular una notificación
const showNotification = (mensaje: string, tipo: "success" | "error") => {
  console.log(`Notificación (${tipo}): ${mensaje}`);
};

// Se asume que estas variables se obtienen de un contexto o archivo de configuración
const session = { idUsuario: "ejemplo_id_usuario_abc" }; // Simulación de datos de sesión

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
  if (!Visible) return null;

  const [fechaPago, setFechaPago] = useState<string>("");
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [fechaRegistro, setFechaRegistro] = useState<string>("");
  const [periodoActual, setPeriodoActual] = useState<string>("");

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
    
    const month = now.getMonth(); // getMonth() returns 0-11
    const year = now.getFullYear();
    const formattedPeriodo = `${year}-${(month + 1).toString().padStart(2, '0')}`;
    setPeriodoActual(formattedPeriodo);

  }, []);

  const handleGuardar = async () => {
    // Validar que se haya seleccionado un archivo y una fecha
    if (!comprobanteFile || !fechaPago) {
      showNotification("Por favor, selecciona una fecha y un archivo de comprobante.", "error");
      return;
    }

    setLoading(true);

    try {
      // 1. Convertir el archivo a Base64
      const archivoBase64 = await fileToBase64(comprobanteFile);
      const fileNameParts = comprobanteFile.name.split('.');
      const fileExtension = fileNameParts.pop() || '';
      const fileName = fileNameParts.join('.');

      // 2. Construir el objeto de datos que coincide con el esquema del backend
      const datosParaGuardar: RegistroPagoData = {        
        idCliente: "ejemplo_id_cliente_123", // Reemplazar con el ID real
        idUsuarioRegistro: session.idUsuario, // Usar el ID de sesión
        
        NombreArhivo: fileName,
        ExtencionArchivo: fileExtension,
        FechaPago: new Date(fechaPago),
        PeriodoFiscal: new Date(periodoActual),
        FechaRegistro: new Date(),
        ArchivoBase64: archivoBase64,
      };

      // 3. Llamada a la API
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
    >
      <div className="w-full max-w-4xl max-h-[90dvh] overflow-auto rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 scale-100">
        <div className="text-2xl font-bold text-blue-900">
          Registro de Pagos
        </div>
        <br />

        <div className="bg-gray-100 p-4 rounded-xl flex justify-between items-center text-sm mb-4">
          <div className="flex flex-col">
            <span className="font-semibold text-gray-700">Período Actual:</span>
            <input
              type="month"
              value={periodoActual}
              readOnly
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
      </div>
    </div>
  );
};

export default RegistroPagos;
