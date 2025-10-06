// app/dashboard/administracion/usuarios/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importa el hook useRouter
import ToggleSwitch from "@/src/hooks/ToggleSwitch";
import Cargando from '@/src/hooks/Cargando';
import { useNotification } from '@/src/hooks/useNotifications';
import { Modulo, Permiso, TipoUsuario, Cliente, GrupoEmpresarial } from '@/src/Interfaces/Interfaces';
import { ObtenerSesionUsuario } from '@/src/utils/constantes';
import ModalBitacoraContibuyente from '@/src/hooks/ModalBitacoraContibuyente';
import MensajeNotificacion from '@/src/hooks/MensajeNotificacion';
import ModalPregunta from '@/src/hooks/ModalPregunta';
import ModalBuscarContribuyentes from '@/src/hooks/ModalBuscarContribuyentes';
import ModalBuscarGrupo from '@/src/hooks/ModalBuscarGrupo';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

enum TipoFiltro {
  Fechas = "Fechas",
  Contribuyente = "Contribuyente",
  Grupo = "Grupo",
  Folios = "Folios",
}


class nuevoCliente {
  RazonSocial: string = "";
  idGrupoEmpresarial: string = "";
  RFC: string = "";
  ServiciosSeleccionados: string[] = [];
  RepresentanteLegal: { Nombre: string, RFC: string, Alias: string, Cumpleanos: string } = { Nombre: "", RFC: "", Alias: "", Cumpleanos: "" };
  DuenoEmpresa: { Nombre: string, Telefono: string, Correo: string, Cumpleanos: string } = { Nombre: "", Telefono: "", Correo: "", Cumpleanos: "" };
  ContactoCobranza: { Nombre: string, Telefono: string, Correo: string, Cumpleanos: string } = { Nombre: "", Telefono: "", Correo: "", Cumpleanos: "" };
  GerenteOperativo: { Nombre: string, Telefono: string, Correo: string, Cumpleanos: string } = { Nombre: "", Telefono: "", Correo: "", Cumpleanos: "" };
  EnlaceAkha: { Nombre: string, Telefono: string, Correo: string, Cumpleanos: string } = { Nombre: "", Telefono: "", Correo: "", Cumpleanos: "" };
  Cumpleanos: string = "";
}
export default function Pagos() {
  // Inicializa el router para la navegación
  const router = useRouter();
  const sesion = ObtenerSesionUsuario();
  const { notification, showNotification, hideNotification } = useNotification();

  const [ListaPagos, setListaPagos] = useState<Cliente[]>([]);
  const [RazonesSociales, setRazonesSociales] = useState<Cliente[]>([]);

  const [RazonSocial, setRazonSocial] = useState<string>("");
  const [FechaInicio, setFechaInicio] = useState<string>("");
  const [FechaFin, setFechaFin] = useState<string>("");
  const [Filtro, setFiltro] = useState<TipoFiltro>(TipoFiltro.Fechas);
  const [ContribuyenteBuscar, setContribuyenteBuscar] = useState<Cliente>(new nuevoCliente());
  const [GrupoBuscar, setGrupoBuscar] = useState<GrupoEmpresarial>({_id: "",Nombre: ""});
  const [FolioVenta, setFolioVenta] = useState<string>("");
  const [FolioFactura, setFolioFactura] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenContribuyente, setIsOpenContribuyente] = useState<boolean>(false);
  const [isOpenGrupo, setIsOpenGrupo] = useState<boolean>(false);

  const [TotalEfectivo, setTotalEfectivo] = useState<number>(0);
  const [TotalCheque, setTotalCheque] = useState<number>(0);
  const [TotalTransferencia, setTotalTransferencia] = useState<number>(0);
  const [TotalDeposito, setTotalDeposito] = useState<number>(0);
  const [TotalCredito, setTotalCredito] = useState<number>(0);
  const [TotalDebito, setTotalDebito] = useState<number>(0);
  const [TotalPagos, setTotalPagos] = useState<number>(0);



  useEffect(() => {
    async function Iniciar() {
      await ListarRazonesSociales();
    }
    let hoy = new Date().toISOString().split('T')[0];
    setFechaInicio(hoy);
    setFechaFin(hoy);
    Iniciar();
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
  const CerrarModalGrupo = (value: boolean | null | GrupoEmpresarial | GrupoEmpresarial[]) => {
    setIsOpenGrupo(false);
    if (value != false) {
      if (value == null) {
        setGrupoBuscar({ _id: "", Nombre: "" });
      } else {
        setGrupoBuscar(value as GrupoEmpresarial);
      }
    }
  };
  return (
    <div className="p-10 flex-1 overflow-auto">
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extrabold text-blue-900">Gestión de Pagos</h2>

          <div className="flex space-x-4">
            <button
              onClick={() => {
                console.log("Regresando a /dashboard...");
                router.push('/dashboard');
              }}
              className="rounded-lg bg-gray-300 px-6 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-400"
            >
              Regresar
            </button>
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="">
              <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">
                Tipo filtro
              </label>
              <select
                id="Filtro"
                value={Filtro}
                onChange={(e) => setFiltro(e.target.value as TipoFiltro)}
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value={TipoFiltro.Fechas}>{TipoFiltro.Fechas}</option>
                <option value={TipoFiltro.Contribuyente}>{TipoFiltro.Contribuyente}</option>
                <option value={TipoFiltro.Grupo}>{TipoFiltro.Grupo}</option>
                <option value={TipoFiltro.Folios}>{TipoFiltro.Folios}</option>
              </select>
            </div>
            <div className="">
              <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">
                Fecha inicial
              </label>
              <input
                type="date"
                id="FechaInicio"
                value={FechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                placeholder="Fecha inicial..."
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div className="">
              <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">
                Fecha final
              </label>
              <input
                type="date"
                id="FechaFin"
                value={FechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                placeholder="Fecha final..."
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            {
              Filtro == TipoFiltro.Fechas && (
                <div className="">
                  <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">
                    Razón social
                  </label>
                  <select
                    id="RazonSocial"
                    value={RazonSocial}
                    onChange={(e) => setRazonSocial(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Todos</option>
                    {
                      RazonesSociales.map((item) => (
                        <option key={item._id} value={item._id}>{item.RazonSocial}</option>
                      ))
                    }
                  </select>
                </div>
              )
            }
            {
              Filtro == TipoFiltro.Contribuyente &&
              <div className="">
                <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">
                  Contribuyente
                </label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    type="text"
                    id="NombreBuscar"
                    value={ContribuyenteBuscar.RazonSocial}
                    placeholder="Buscar por nombre..."
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <button className="float-right rounded-lg text-white bg-blue-600 px-2 py-1 text-sm font-medium transition-colors duration-200 hover:bg-blue-700"
                    onClick={() => setIsOpenContribuyente(true)} >
                    <i className="material-symbols-rounded filled">search</i>
                  </button>
                </div>
              </div>
            }
            {
              Filtro == TipoFiltro.Grupo &&
              <div className="">
                <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">
                  Grupo
                </label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    type="text"
                    id="NombreBuscar"
                    value={GrupoBuscar.Nombre}
                    placeholder="Buscar por nombre..."
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <button className="float-right rounded-lg text-white bg-blue-600 px-2 py-1 text-sm font-medium transition-colors duration-200 hover:bg-blue-700"
                    onClick={() => setIsOpenGrupo(true)} >
                    <i className="material-symbols-rounded filled">search</i>
                  </button>
                </div>
              </div>
            }
            {
              Filtro == TipoFiltro.Folios &&
              <div className="">
                <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">
                  Folio de venta
                </label>
                <input
                  readOnly
                  type="text"
                  id="FolioVenta"
                  value={FolioVenta}
                  onChange={(e) => setFolioVenta(e.target.value)}
                  placeholder="Buscar por folio de venta..."
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            }
            {
              Filtro == TipoFiltro.Folios &&
              <div className="">
                <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">
                  Folio de factura
                </label>
                <input
                  readOnly
                  type="text"
                  id="FolioFactura"
                  value={FolioFactura}
                  onChange={(e) => setFolioFactura(e.target.value)}
                  placeholder="Buscar por folio de factura..."
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            }

          </div>
          <div className="w-full flex justify-end mt-4">
            <button className="rounded-lg text-white bg-blue-600 px-6 py-2 text-sm font-medium transition-colors duration-200 hover:bg-blue-700"
              onClick={() => { }}> Buscar </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl bg-white p-6 shadow-md">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-left text-gray-700 ">
                <th className="px-4 py-2 ">Fecha</th>
                <th className="px-4 py-2 ">Folio</th>
                <th className="px-4 py-2 ">Contribuyente</th>
                <th className="px-4 py-2 ">Empresa</th>
                <th className="px-4 py-2 ">Tipo de Pago</th>
                <th className="px-4 py-2 text-center">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {ListaPagos.map(pago => (
                <tr key={pago._id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-2">{pago.RazonSocial}</td>
                  <td className="px-4 py-2">{pago.RFC}</td>
                </tr>
              ))}
              <tr className="border-gray-200 hover:bg-gray-50">
                <td colSpan={5} className="px-4 py-1 text-right">Efectivo</td>
                <td className="px-4 py-1 text-center">{TotalEfectivo}</td>
              </tr>
              <tr className="py-1 text-centerborder-gray-200 hover:bg-gray-50">
                <td colSpan={5} className="px-4 py-1 text-right">Tarjeta de crédito</td>
                <td className="px-4 py-1 text-center">{TotalCredito}</td>
              </tr>
              <tr className="py-1 text-centerborder-gray-200 hover:bg-gray-50">
                <td colSpan={5} className="px-4 py-1 text-right">Tarjeta de débito</td>
                <td className="px-4 py-1 text-center">{TotalDebito}</td>
              </tr>
              <tr className="py-1 text-centerborder-gray-200 hover:bg-gray-50">
                <td colSpan={5} className="px-4 py-1 text-right">Transferencia</td>
                <td className="px-4 py-1 text-center">{TotalTransferencia}</td>
              </tr>
              <tr className="py-1 text-centerborder-gray-200 hover:bg-gray-50">
                <td colSpan={5} className="px-4 py-1 text-right">Depósito</td>
                <td className="px-4 py-1 text-center">{TotalDeposito}</td>
              </tr>
              <tr className="py-1 text-centerborder-gray-200 hover:bg-gray-50">
                <td colSpan={5} className="px-4 py-1 text-right">Cheque</td>
                <td className="px-4 py-1 text-center">{TotalCheque}</td>
              </tr>
              <tr className="py-1 text-centerborder-gray-200 hover:bg-gray-50">
                <td colSpan={5} className="px-4 py-1 text-right">Total</td>
                <td className="px-4 py-1 text-center">{TotalPagos}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {isOpenContribuyente && <ModalBuscarContribuyentes multiple={false} onChange={CerrarModalContribuyente} />}
        {isOpenGrupo && <ModalBuscarGrupo multiple={false} onChange={CerrarModalGrupo} />}
        <MensajeNotificacion {...notification} hideNotification={hideNotification} />
        <Cargando isLoading={isLoading} />
      </div>
    </div>
  );
};
