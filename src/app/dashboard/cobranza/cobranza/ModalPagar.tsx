import { useNotification } from "@/src/hooks/useNotifications";
import MensajeNotificacion from "@/src/hooks/MensajeNotificacion";
import { useState, useEffect } from "react";
import { MetodoPago } from "@/src/Interfaces/enums";
import { Cliente, PagoItem, RazonSocial, Venta } from "@/src/Interfaces/Interfaces";
import { API_BASE_URL, convertirPesos, PORCENTAJE_IVA } from "@/src/utils/constantes";
import Cargando from "@/src/hooks/Cargando";
import ReciboPago from "@/src/formatos/ReciboPago";

interface ModalPagarProps {
  Visible: boolean;
  ListaPagos: PagoItem[];
  ClienteSeleccionado: Cliente;
  Cerrar: (exito: string) => void; // callback al cambiar
}

export default function ModalPagar({ Visible, ClienteSeleccionado,ListaPagos, Cerrar }: ModalPagarProps) {
  if (!Visible) return null;
  const { notification, showNotification, hideNotification } = useNotification();
  const [MetodoPagado, setMetodoPagado] = useState<MetodoPago | "">("");
  const [TotalPagar, setTotalPagar] = useState<number>(1000);
  const [MontoPagado, setMontoPagado] = useState<number>(0);
  const [Referencia, setReferencia] = useState<string>("");
  const [RazonesSociales, setRazonesSociales] = useState<RazonSocial[]>([]);
  const [IsLoading, setIsLoading] = useState<boolean>(false);
  const [showRecibo, setShowRecibo] = useState<boolean>(false);
  const [RequiereFactura, setRequiereFactura] = useState<boolean>(false);
  const [idRazonSocial, setidRazonSocial] = useState<string>("");
  const [RazonSocialSeleccionado, setRazonSocialSeleccionado] = useState<RazonSocial | null>(null);
  const [NuevaVenta, setNuevaVenta] = useState<Venta>({
    idCliente: ClienteSeleccionado._id || "",
    Pagos: ListaPagos,
    Total: 0,
    MetodoPago: MetodoPago.Efectivo,
    Referencia: "",
    NecesitaFactura: false,
    FechaRegistro: new Date(),
  });




  useEffect(() => {
    const total = ListaPagos.reduce((acc, item) => acc + (item.Cantidad || 0), 0);
    setTotalPagar(total);
    ListarRazonesSociales();
  }, []);

  const ListarRazonesSociales = async () => {
    setIsLoading(true);
    setRazonesSociales([]);
    try {
      const response = await fetch(`${API_BASE_URL}/razonessociales/ListarRazonSocialActiva`);
      // Se añade un manejo de errores más robusto al intentar parsear la respuesta
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setRazonesSociales(data.data);
      } else {
        const text = await response.text();
        console.error('La respuesta de la API no es JSON:', text);
        throw new Error('La API no devolvió un formato JSON válido.');
      }
    } catch (err: any) {
      console.error('Error al obtener las actividades:', err);
    } finally {
      setIsLoading(false);
    }
  };
  const ValidarDatos = () => {
    let Valido = true;
    if (!MetodoPagado) {
      showNotification("El metodo de pago es obligatorio","error");
      Valido = false;
    }else if(MetodoPagado !== MetodoPago.Efectivo){
      if (!Referencia) {
        showNotification("La referencia es obligatoria","error");
        Valido = false;
      }
    }
    return Valido;
  }
  const Guardar = () => {
    if (!ValidarDatos()) return false;

    let iva = (TotalPagar * PORCENTAJE_IVA)/(1+PORCENTAJE_IVA);
    let subtotal = TotalPagar - iva;
    setNuevaVenta({
      ...NuevaVenta,
      idRazonSocial: idRazonSocial,
      Total: TotalPagar,
      MetodoPago: MetodoPagado as MetodoPago,
      Referencia: Referencia,
      NecesitaFactura: RequiereFactura,
      SubTotal: subtotal,
      IVA: iva,
    })

    setShowRecibo(true);
    setTimeout(() => {
      setShowRecibo(false);
      Cerrar("success");
    }, 100);
  }
  const cambiarValorRazonSocial = (id: string) => {
    let razon = RazonesSociales.find((item) => item._id === id);
    setidRazonSocial(id);
    setRazonSocialSeleccionado(razon || null);
  }
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 opacity-100 backdrop-blur-sm}`}
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
    >
      <div className={`w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 scale-100`}>
        <h3 className="text-lg text-gray-800 mt-2"><b>Cliente:</b> {ClienteSeleccionado.RazonSocial || ""}</h3>
        <h3 className="text-lg text-gray-800 mt-2"><b>Total:</b> {convertirPesos(TotalPagar)}</h3>


        <h3 className="text-lg text-gray-800 mt-2"><b>Razon social:</b></h3>
        <select
          id="RazonSocial"
          value={idRazonSocial}
          onChange={(e) => cambiarValorRazonSocial(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="" disabled>Seleccione una razón social</option>
          {
            RazonesSociales.map((item) => (
              <option key={item._id} value={item._id}>{item.RazonSocial}</option>
            ))
          }
        </select>
                
        <h3 className="text-lg text-gray-800 mt-2"><b>Metodo de pago:</b></h3>
        <select
          className="w-full border border-gray-300 rounded-md px-4 py-2 mt-4"
          value={MetodoPagado}
          onChange={(e) => setMetodoPagado(e.target.value as MetodoPago)}
        >
          <option value="" disabled>Seleccione un metodo de pago</option>
          <option value={MetodoPago.Efectivo}>Efectivo</option>
          <option value={MetodoPago.Tarjeta_credito}>Tarjeta de crédito</option>
          <option value={MetodoPago.Tarjeta_debito}>Tarjeta de debito</option>
          <option value={MetodoPago.Transferencia}>Transferencia</option>
          <option value={MetodoPago.Deposito}>Depósito</option>
          <option value={MetodoPago.Cheque}>Cheque</option>
        </select>

        {MetodoPagado === MetodoPago.Efectivo && (
          <div className="mt-4">
            <label className="block text-gray-700">
        <h3 className="text-lg text-gray-800 mt-2"><b>Monto pagado:</b></h3>

              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-4 py-2 mt-1"
                value={MontoPagado}
                onChange={(e) => setMontoPagado(parseFloat(e.target.value) || 0)}
              />
            </label>

            <p className="text-gray-700 mt-2">
              Cambio: {convertirPesos(Math.max(0, MontoPagado - TotalPagar))}
            </p>
          </div>
        )}
        {MetodoPagado !== "" && MetodoPagado !== MetodoPago.Efectivo && (
          <div className="mt-4">
            <label className="block text-gray-700">
              <h3 className="text-lg text-gray-800 mt-2"><b>Referencia:</b></h3>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-4 py-2 mt-1"
                value={Referencia}
                onChange={(e) => setReferencia(e.target.value)}
              />
            </label>
          </div>
        )}

        <div className="mt-4 flex items-center">
          <input
            type="checkbox"
            checked={RequiereFactura}
            onChange={(e) => setRequiereFactura(e.target.checked)}
            className="mr-2"
          />
          <span className="w-full text-sm text-gray-600">Necesita factura</span>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={() => Cerrar("")} className="rounded-md bg-red-300 px-4 py-2 text-gray-800 transition-colors hover:bg-red-400">
            Cancelar
          </button>
          <button onClick={Guardar} className="rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700">
            Aceptar
          </button>
        </div>
      </div>

      <Cargando isLoading={IsLoading} />
      <MensajeNotificacion {...notification} hideNotification={hideNotification} />
      {showRecibo && <ReciboPago venta={NuevaVenta} razonSocial={RazonSocialSeleccionado as RazonSocial} contribuyente={ClienteSeleccionado} />}
    </div>
  );
}