// app/dashboard/administracion/usuarios/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importa el hook useRouter
import ToggleSwitch from "@/src/hooks/ToggleSwitch";
import Cargando from '@/src/hooks/Cargando';
import { useNotification } from '@/src/hooks/useNotifications';
import { Modulo, Permiso, GrupoEmpresarial, Cliente } from '@/src/Interfaces/Interfaces';

import { API_BASE_URL, ObtenerSesionUsuario } from '@/src/utils/constantes';
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
  RepresentanteLegal= { Nombre: "", RFC: "", Alias: "", Cumpleanos: "" };
  DuenoEmpresa = { Nombre: "", Telefono: "", Correo: "", Cumpleanos: "" };
  ContactoCobranza = { Nombre: "", Telefono: "", Correo: "", Cumpleanos: "" };
  GerenteOperativo = { Nombre: "", Telefono: "", Correo: "", Cumpleanos: "" };
  EnlaceAkha = { Nombre: "", Telefono: "", Correo: "", Cumpleanos: "" };
  Cumpleanos: string = "";
}

// Componente para la vista de CRUD de Usuarios
const Cobranza = () => {
  // Inicializa el router para la navegación
  const sesion = ObtenerSesionUsuario();
  const router = useRouter();
  const { notification, showNotification, hideNotification } = useNotification();

  const [ListaDeudas, setListaDeudas] = useState<any[]>([]);
  const [ListaPagos, setListaPagos] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showBitacora, setShowBitacora] = useState(false);
  const [idEditar, setIdEditar] = useState<string>("");
  const [editar, setEditar] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pregunta, setPregunta] = useState<string>("");
  const [operacion, setOperacion] = useState<string>("");
  const [NombreBuscar, setNombreBuscar] = useState<string>("");
  const [ResponsableBuscar, setResponsableBuscar] = useState<string>("");
  const [EstadoBuscar, setEstadoBuscar] = useState<number>(0);

  const [ContribuyenteBuscar, setContribuyenteBuscar] = useState<Cliente>(new nuevoCliente());

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenContribuyente, setIsOpenContribuyente] = useState<boolean>(false);
  const [isOpenPagar, setIsOpenPagar] = useState<boolean>(false);


  useEffect(() => {
  }, []);

  const Listar = async () => {
    setIsLoading(true);
    setListaDeudas([]);
    try {
      const response = await fetch(`${API_BASE_URL}/gruposempresariales/ListarGrupos`);
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
  const Buscar = async () => {
    setIsLoading(true);
    setListaDeudas([]);
    try {
      const response = await fetch(`${API_BASE_URL}/gruposempresariales/BuscarGrupo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Nombre: NombreBuscar,
          Responsable: ResponsableBuscar,
          Estado: EstadoBuscar,
        } as GrupoEmpresarial),
      });
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
      showNotification("Pago realizado con éxito","success");
    }
  };

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
            <tr className="bg-gray-200 text-center text-gray-700 ">
              <th className="px-4 py-2 text-left">Descripción</th>
              <th className="px-4 py-2">Fecha limite de pago</th>
              <th className="px-4 py-2">Precio</th>
              <th className="px-4 py-2">Pendiente</th>
              <th className="px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ListaDeudas.map(grupo => (
              <tr key={grupo._id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2 text-left">{grupo.Nombre}</td>
                <td className="px-4 py-2">{grupo.Nombre}</td>
                <td className="px-4 py-2">{grupo.Nombre}</td>
                <td className="px-4 py-2 flex justify-end space-x-2 ">
                  <button onClick={() => { }} className="rounded-md bg-blue-600 px-4 py-1 text-sm text-white transition-colors duration-200 hover:bg-blue-700">
                    <i className="material-symbols-rounded filled">visibility</i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Seperador Titulo='Detalle del pago' />
      <div className="overflow-x-auto rounded-xl bg-white p-6 shadow-md">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-right text-gray-700 ">
              <th className="px-4 py-2 text-left">Descripción</th>
              <th className="px-4 py-2">Precio</th>
              <th className="px-4 py-2">Pendiente</th>
              <th className="px-4 py-2">SubTotal</th>
              <th className="px-4 py-2">IVA</th>
              <th className="px-4 py-2">Importe / abono</th>
            </tr>
          </thead>
          <tbody>
            {ListaDeudas.map(grupo => (
              <tr key={grupo._id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2 text-left">{grupo.Nombre}</td>
                <td className="px-4 py-2">{grupo.Nombre}</td>
                <td className="px-4 py-2">{grupo.Nombre}</td>
                <td className="px-4 py-2 flex justify-end space-x-2 ">
                  <input type="number" className="w-16 px-2 py-1 border border-gray-300 rounded-md" />
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
          NombreCliente={ContribuyenteBuscar.RazonSocial || ""}
          idCliente={ContribuyenteBuscar._id || ""}
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
