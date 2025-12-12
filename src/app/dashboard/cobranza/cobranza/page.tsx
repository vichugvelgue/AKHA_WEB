// app/dashboard/administracion/usuarios/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importa el hook useRouter
import ToggleSwitch from "@/src/hooks/ToggleSwitch";
import Cargando from '@/src/hooks/Cargando';
import { useNotification } from '@/src/hooks/useNotifications';
import { Modulo, PagoItem, GrupoEmpresarial, Cliente, PagoPendiente, Venta } from '@/src/Interfaces/Interfaces';

import { API_BASE_URL, convertirPesos, ObtenerSesionUsuario, PORCENTAJE_IVA } from '@/src/utils/constantes';
import ModalBitacoraGrupo from '@/src/hooks/ModalBitacoraGrupo';
import MensajeNotificacion from '@/src/hooks/MensajeNotificacion';
import Seperador from '@/src/hooks/Separador';
import ModalBuscarContribuyentes from '@/src/hooks/ModalBuscarContribuyentes';
import ModalPagar from './ModalPagar';

class nuevoCliente {
  RazonSocial: string = "";
  idGrupoEmpresarial: string = "";
  RFC: string = "";
  ServiciosSeleccionados: string[] = [];
  RepresentanteLegal = { Nombre: "", RFC: "", Alias: "", Cumpleanos: "" };
  DuenoEmpresa = { Nombre: "", Telefono: "", Correo: "", Cumpleanos: "" };
  ContactoCobranza = { Nombre: "", Telefono: "", Correo: "", Cumpleanos: "" };
  GerenteOperativo = { Nombre: "", Telefono: "", Correo: "", Cumpleanos: "" };
  EnlaceAkha = { Nombre: "", Telefono: "", Correo: "", Cumpleanos: "" };
  Cumpleanos: string = "";
  ActividadesSeleccionadas: string[] = [];
}

interface PagoPendienteItem extends PagoPendiente {
  Seleccionado: boolean;
}

// Componente para la vista de CRUD de Usuarios
const Cobranza = () => {
  // Inicializa el router para la navegación
  const sesion = ObtenerSesionUsuario();
  const router = useRouter();
  const { notification, showNotification, hideNotification } = useNotification();

  const [ListaDeudas, setListaDeudas] = useState<PagoPendienteItem[]>([]);
  const [ListaPagos, setListaPagos] = useState<PagoItem[]>([]);

  const [error, setError] = useState<string | null>(null);

  const [ContribuyenteBuscar, setContribuyenteBuscar] = useState<Cliente>(new nuevoCliente());

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenContribuyente, setIsOpenContribuyente] = useState<boolean>(false);
  const [isOpenPagar, setIsOpenPagar] = useState<boolean>(false);


  useEffect(() => {
    Listar();
  }, [ContribuyenteBuscar]);

  const Listar = async () => {
    setIsLoading(true);
    setListaDeudas([]);
    setListaPagos([]);
    if (!ContribuyenteBuscar._id) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/pagos/ObtenerPagosPendientesPorCliente/${ContribuyenteBuscar._id}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      // Se añade un manejo de errores más robusto al intentar parsear la respuesta
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setListaDeudas(data.data);
      } else {
        const text = await response.text();
        console.error('La respuesta de la API no es JSON:', text);
        throw new Error('La API no devolvió un formato JSON válido.');
      }
    } catch (err: any) {
      console.error('Error al obtener las actividades:', err);
      setError(err.message || 'Hubo un error al cargar las actividades. Verifica que la API esté corriendo y responda correctamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const AgregarPago = (pago: PagoPendienteItem, index: number) => {
    let nuevosDeudas = [...ListaDeudas];
    nuevosDeudas[index].Seleccionado = true;
    setListaDeudas(nuevosDeudas);

    let iva = (pago.Pendiente * PORCENTAJE_IVA)/(1+PORCENTAJE_IVA);
    let subtotal = pago.Pendiente - iva;

    let pagoItem: PagoItem = {
      idPago: pago._id,
      Descripcion: pago.Descripcion,
      Cantidad: pago.Pendiente,
      Pendiente: pago.Pendiente,
      IVA: parseFloat(iva.toFixed(2)),
      Subtotal: parseFloat(subtotal.toFixed(2)),
    }
    setListaPagos([...ListaPagos, pagoItem]);
  }

  const EliminarPago = (index: number) => {
    let nuevosDeudas = [...ListaDeudas];
    let indexDeuda = nuevosDeudas.findIndex((deuda) => deuda._id == ListaPagos[index].idPago);
    if (indexDeuda == -1) return;
      
    nuevosDeudas[indexDeuda].Seleccionado = false;
    setListaDeudas(nuevosDeudas);

    let nuevosPagos = [...ListaPagos];
    nuevosPagos.splice(index, 1);
    setListaPagos(nuevosPagos);
  }

  const CerrarModalContribuyente = (value: boolean | null | Cliente | Cliente[]) => {
    setIsOpenContribuyente(false);
    if (value != false) {
      if (value == null) {
        setContribuyenteBuscar(new nuevoCliente());
      } else {
        setContribuyenteBuscar(value as Cliente);
      }
    }
  };
  const CerrarModalPagar = (exito: string) => {
    setIsOpenPagar(false);
    if (exito == "success") {
      showNotification("Pago realizado con éxito", "success");
    }
  };

  const cambiarValorPago = (index: number, valor: number) => {
    
    let iva = (valor * PORCENTAJE_IVA)/(1+PORCENTAJE_IVA);
    let subtotal = valor - iva;
    
    let nuevosPagos = [...ListaPagos];
    nuevosPagos[index].Cantidad = valor;
    nuevosPagos[index].Subtotal = parseFloat(subtotal.toFixed(2));
    nuevosPagos[index].IVA = parseFloat(iva.toFixed(2));
    setListaPagos(nuevosPagos);
  }
  return (
    <div className="space-y-6 p-4">
      <div className="bg-white shadow-xl rounded-xl p-6 mb-6 border-l-4 border-indigo-600">
        <div className="flex items-center justify-between flex-wrap">
          <div className='w-full'>
            <div className='flex items-center justify-between flex-wrap'>
              <h1 className="text-2xl font-medium text-gray-500 mb-1">Cobranza</h1>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <button className="rounded-lg bg-gray-300 px-6 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-400"
                  onClick={() => router.push('/dashboard')} > Regresar </button>
                <button className="float-right rounded-lg text-white bg-blue-600 px-6 py-2 text-sm font-medium transition-colors duration-200 hover:bg-blue-700"
                  onClick={() => setIsOpenContribuyente(true)} > Buscar contribuyente </button>
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-indigo-900 truncate max-w-lg mb-1">
              {ContribuyenteBuscar.RazonSocial}
            </h2>
            <h1 className="text-xl font-medium text-gray-500 mb-1">{ContribuyenteBuscar.RFC}</h1>
            <h1 className="text-xl font-medium text-gray-500 mb-1">{ContribuyenteBuscar.idGrupoEmpresarial}</h1>
            {/* <h1 className="text-xl font-medium text-gray-500 mb-1">{!ContribuyenteBuscar.Estado ? "" : ContribuyenteBuscar.Estado == 1 ? 'Activo' : 'Inactivo'}</h1> */}
          </div>
        </div>
      </div>
      <Seperador Titulo='Pagos pendientes' />
      <div className="overflow-x-auto rounded-xl bg-white p-6 shadow-md">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-right text-gray-700 ">
              <th className="px-4 py-2 text-left">Descripción</th>
              <th className="px-4 py-2">Fecha limite de pago</th>
              <th className="px-4 py-2">Precio</th>
              <th className="px-4 py-2">Pendiente</th>
              <th className="px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ListaDeudas.map((deuda, index) => (
              <tr hidden={deuda.Seleccionado} key={deuda._id} className="border-t text-right border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2 text-left">{deuda.Descripcion}</td>
                <td className="px-4 py-2">{deuda.FechaVencimiento ? new Date(deuda.FechaVencimiento).toLocaleDateString() : ''}</td>
                <td className="px-4 py-2">{convertirPesos(deuda.Monto)}</td>
                <td className="px-4 py-2">{convertirPesos(deuda.Pendiente)}</td>
                <td className="px-4 py-2 flex justify-end space-x-2 ">
                  <button onClick={() => AgregarPago(deuda, index)} className="rounded-md bg-blue-600 px-4 py-1 text-sm text-white transition-colors duration-200 hover:bg-blue-700">
                    <i className="material-symbols-rounded filled">add_2</i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Seperador Titulo='Detalle del pago' />
      <div className="overflow-x-auto rounded-xl bg-white p-6 shadow-md">
        <table className="min-w-full text-sm text-right border-collapse">
          <thead className="bg-gray-200 text-gray-700 font-medium">
            <tr>
              <th className="px-4 py-2 text-left"></th>
              <th className="px-4 py-2 text-left">Descripción</th>
              <th className="px-4 py-2">Pendiente</th>
              <th className="px-4 py-2">SubTotal</th>
              <th className="px-4 py-2">IVA</th>
              <th className="px-4 py-2 text-right">Importe / abono</th>
            </tr>
          </thead>
          <tbody>
            {ListaPagos.map((pago, index) => (
              <tr
                key={pago.idPago}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <td className="px-4 py-2 justify-left">
                  <button
                    onClick={() => EliminarPago(index)}
                    title='Cancelar pago'
                    className="bg-red-500 text-white hover:bg-red-700 font-semibold transition-all flex items-center justify-center p-2 rounded-full mx-auto shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300"
                  >
                    <i className="material-symbols-rounded filled">delete</i>
                  </button>
                </td>
                <td className="px-4 py-2 text-left">{pago.Descripcion}</td>
                <td className="px-4 py-2">{convertirPesos(pago.Pendiente || 0)}</td>
                <td className="px-4 py-2">{convertirPesos(pago.Subtotal || 0)}</td>
                <td className="px-4 py-2">{convertirPesos(pago.IVA || 0)}</td>
                <td className="px-4 py-2">
                  <input
                    className="w-full max-w-[100px] px-2 py-1 border border-gray-300 rounded-md text-right"
                    type="number"
                    onChange={(e) => cambiarValorPago(index, Number(e.target.value))}
                    value={pago.Cantidad || 0}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>



        <br />
        <button className="float-right rounded-lg text-white bg-blue-600 px-6 py-2 text-sm font-medium transition-colors duration-200 hover:bg-blue-700"
          onClick={() => setIsOpenPagar(true)} > Pagar </button>
      </div>

      {isOpenPagar &&
        <ModalPagar
          Visible={isOpenPagar}
          ListaPagos={ListaPagos}
          ClienteSeleccionado={ContribuyenteBuscar}
          Cerrar={CerrarModalPagar}
        />
      }
      {isOpenContribuyente &&
        <ModalBuscarContribuyentes
          multiple={false}
          onChange={CerrarModalContribuyente}
        />
      }
      <Cargando isLoading={isLoading} />
      <MensajeNotificacion {...notification} hideNotification={hideNotification} />
    </div>
  );
};

export default function CobranzaPage() {
  return (
    <div className="p-10 flex-1 overflow-auto">
      <Cobranza />
    </div>
  );
}
