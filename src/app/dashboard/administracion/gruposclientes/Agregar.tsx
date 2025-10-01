'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cargando from '@/src/hooks/Cargando';
import Separador from '@/src/hooks/Separador';



import { useNotification } from '@/src/hooks/useNotifications';
import { Cliente, GrupoEmpresarial, User } from '@/src/Interfaces/Interfaces';
import ModalBuscarContribuyentes from '@/src/hooks/ModalBuscarContribuyentes';
import ModalBuscarContador from '@/src/hooks/ModalBuscarContador';
import { ObtenerSesionUsuario } from '@/src/utils/constantes';
import AccesoContribuyentesAgregar from '@/src/hooks/AccesoContribuyentesAgregar';
import ModalPregunta from '@/src/hooks/ModalPregunta';
import MensajeNotificacion from '@/src/hooks/MensajeNotificacion';
import ModalMotivos from '@/src/hooks/ModalMotivos';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';



// Definimos una interfaz para las propiedades del modal de registro
interface ModalProps {
  idEditar?: string;
  Editar: boolean;
  onClose: () => void;
  onRegister: (Mensaje: string, Color: "success" | "error" | "warning") => void;
}

class errorInterface {
  Nombre: boolean = false;
  responsable: boolean = false;
  idContador: boolean = false;
}
// Componente para la vista de CRUD de Usuarios
const GruposEmpresarialesAgregar = ({ idEditar, Editar = false, onClose, onRegister }: ModalProps) => {
  // Inicializa el router para la navegación
  const [formState, setFormState] = useState<GrupoEmpresarial>({
    Nombre: "",
    Responsable: "",
    idResponsable: "",
    Contacto: "",
    Observaciones: "",
    ContactoPrincipal: { Nombre: '', Telefono: '', Correo: '' }
  });

  const sesion = ObtenerSesionUsuario();
  const router = useRouter();
  const { notification, showNotification, hideNotification } = useNotification();
  const [EditarGrupo, setEditarGrupo] = useState<boolean>(false);

  const [clientesAsociados, setClientesAsociados] = useState<Cliente[]>([]);
  const [contadorAsosiado, setContadorAsosiado] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpenContador, setIsOpenContador] = useState(false);
  const [isOpenNuevoContribuyente, setIsOpenNuevoContribuyente] = useState(false);
  const [isOpenMotivos, setIsOpenMotivos] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [Errores, setErrores] = useState<errorInterface>(new errorInterface());

  const [asociadoEditar, setAsociadoEditar] = useState<string>("");
  const [Pregunta, setPregunta] = useState<string>("");
  const [OpenPreguntaContador, setOpenPreguntaContador] = useState<boolean>(false);
  const [OpenPreguntaEliminar, setOpenPreguntaEliminar] = useState<boolean>(false);

  useEffect(() => {
    if (idEditar) {
      setFormState({
        ...formState,
        _id: idEditar,
      });
      setEditarGrupo(true);
      ObtenerPorId();
      ObtenerClientesDelGrupo()
    }

    setFormState({
      ...formState,
      idUsuarioCreacion: sesion.idUsuario,
    });
  }, []);

  const ObtenerPorId = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/gruposempresariales/ObtenerPorId/${idEditar}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      // Se añade un manejo de errores más robusto al intentar parsear la respuesta
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setFormState(data.data);
        setContadorAsosiado(data.data.idContador);
      } else {
        const text = await response.text();
        throw new Error('La API no devolvió un formato JSON válido.');
      }
    } catch (err: any) {
      console.error('Error al obtener las actividades:', err);
      showNotification("Ocurrio un error, por favor intente de nuevo.","error")
      // setError(err.message || 'Hubo un error al cargar las actividades. Verifica que la API esté corriendo y responda correctamente.');
    } finally {
      setIsLoading(false);
    }
  };
  const ObtenerClientesDelGrupo = async () => {
    setIsLoading(true);
    setClientesAsociados([]);
    try {
      const response = await fetch(`${API_BASE_URL}/gruposempresariales/ObtenerClientesDelGrupo/${idEditar}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      // Se añade un manejo de errores más robusto al intentar parsear la respuesta
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setClientesAsociados(data.data);
      } else {
        const text = await response.text();
        setClientesAsociados([]);
        throw new Error('La API no devolvió un formato JSON válido.');
      }
    } catch (err: any) {
      showNotification("Ocurrio un error, por favor intente de nuevo.","error")
      // setError(err.message || 'Hubo un error al cargar las actividades. Verifica que la API esté corriendo y responda correctamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name == "TipoResposable") {
      setFormState(prev => ({
        ...prev,
        Responsable: "",
        idResponsable: null,
      }));
    }
    setFormState(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  const validarDatos = () => {
    let valido = true;
    let error = new errorInterface();

    if(!formState.Nombre){
      valido = false
      error.Nombre = true
    }
    if(!formState.Responsable){
      valido = false
      error.responsable = true
    }
    if(!contadorAsosiado){
      valido = false
      error.idContador = true
    }

    setErrores(error);
    if (!valido) {
      showNotification("Por favor, complete todos los campos", "error");
    }

    return valido
  }
  const Guardar = async () => {
    if (!validarDatos()) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/gruposempresariales/GuardarGrupoEmpresarial`, {

        method: Editar ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formState,
          Integrantes: clientesAsociados,
          idContador: contadorAsosiado?._id ?? null
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Error: ${data.mensaje}`);
      }
      showNotification("Grupo empresarial guardado exitosamente", "success");
      onClose();
    } catch (err: any) {
      // setError(err.message || 'Hubo un error al guardar el grupo empresarial. Verifica que la API esté corriendo y responda correctamente.');
      showNotification("Error al guardar el grupo emrpesarial", "error");
    } finally {
      setIsLoading(false);
    }

  }


  const handleNestedInputChange = (section: keyof GrupoEmpresarial, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any), // Corrección: aserción de tipo a 'any'
        [name]: value
      }
    }));
  };

  // Lógica para cerrar el modal y limpiar el estado
  const CerrarModalContribuyente = (value: boolean | null | Cliente | Cliente[]) => {
    setIsModalOpen(false);

    if (value != false) {
      let nuevosClientes = value as Cliente[]
      const listaUnificada = [...clientesAsociados, ...nuevosClientes]
        .reduce<Cliente[]>((acc, cliente) => {
          if (!acc.some(c => c._id === cliente._id)) acc.push(cliente);
          return acc;
        }, []);

      setClientesAsociados(listaUnificada);
    }
  };
  const QuitarContribuyente = (id: string) => {
    setClientesAsociados(clientesAsociados.filter(c => c._id !== id));
  };
  const CerrarModalContador = (value: boolean | null | User | User[]) => {
    setIsOpenContador(false);

    if (value) {
      setContadorAsosiado(value as User);
    }
  };
  const AgregarNuevoContribuyente = (value: boolean | Cliente) => {
    setIsOpenNuevoContribuyente(false);

    if (value != false) {
      let nuevosClientes = value as Cliente
      const listaUnificada = [...clientesAsociados, nuevosClientes]
        .reduce<Cliente[]>((acc, cliente) => {
          if (!acc.some(c => c._id === cliente._id)) acc.push(cliente);
          return acc;
        }, []);

      setClientesAsociados(listaUnificada);
    }
  };
  const ValidarEliminarContribuyente = (id: string) => {
    setAsociadoEditar(id)
    setPregunta("¿Está seguro de cambiar el contador asignado?")
    setOpenPreguntaEliminar(true)
  }
  const CerrarEliminarContribuyente  = (value: boolean) => {
    setOpenPreguntaEliminar(false);
    if (value) {
      QuitarContribuyente(asociadoEditar);
    }
  }
  const AbrirModalContador =()=>{
    if(!contadorAsosiado){
      setIsOpenContador(true)
    }else{
      setOpenPreguntaContador(true)
    }
  }
  const CerrarModalPreguntaContador = (value: boolean) => {
    setOpenPreguntaContador(false);
    if (value) {
      if (EditarGrupo) {
        setIsOpenMotivos(true);
      } else {
        setIsOpenContador(true)
      }
    }
  }
  const CerrarMotivo = (value: string) => {
    setIsOpenMotivos(false);
    if (value) {
      setFormState(prev => ({
        ...prev,
        MotivoReasignacion: value,
      }))
      setIsOpenContador(true)
    }
  }


  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-blue-900">{Editar ? "Editar Grupo o cliente" : "Agregar Grupo o cliente"}</h2>

        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-300 px-6 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-400"
          >
            Regresar
          </button>
        </div>
      </div>

      <div className="grid overflow-x-auto rounded-xl bg-white p-6 shadow-md">

        <Separador Titulo="Información General" />
        <div id="INFORMACION GENERAL" className='grid grid-cols-2 gap-4'>
          <div className='col-span-1'>
            <label className="block text-sm font-medium text-gray-700">Nombre *</label>
            <input
              type="text"
              name="Nombre"
              value={formState.Nombre}
              onChange={handleInputChange}
              required
              // className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              className={`mt-1 block w-full rounded-md bg-gray-50 p-2 shadow-sm focus:border-blue-500
               focus:ring-blue-500 sm:text-sm  ${Errores.Nombre ? "!border-red-500" : "border-gray-300"}`}
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700">
              Responsable Comercial*
            </label>
            <input
              type="text"
              name="Responsable"
              value={formState.Responsable}
              onChange={handleInputChange}
              required
              // className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              className={`mt-1 block w-full rounded-md bg-gray-50 p-2 shadow-sm focus:border-blue-500
               focus:ring-blue-500 sm:text-sm  ${Errores.responsable ? "!border-red-500" : "border-gray-300"}`}
            />

          </div>

          <div className='col-span-5'>
            <label className="block text-sm font-medium text-gray-700">Observaciones</label>
            <textarea
              name="Observaciones"
              value={formState.Observaciones}
              onChange={handleInputChange}
              className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <Separador Titulo="Contador asignado" />
        <div className="flex gap-4">
          <div className="w-full !sm:w-2/3 md:w-1/3">
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="Nombre"
              value={contadorAsosiado?.NombreCompleto || ""}
              // onChange={(e) => handleNestedInputChange('ContactoPrincipal', e)}
              disabled
              className={`mt-1 block w-full rounded-md bg-gray-50 p-2 shadow-sm focus:border-blue-500
               focus:ring-blue-500 sm:text-sm  ${Errores.idContador ? "!border-red-500" : "border-gray-300"}`}
            />
          </div>
          <div className='flex-none flex  items-end'>
            <button onClick={() => AbrirModalContador()}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded-md transition-colors duration-200">
              Asociar Contador
            </button>
          </div>
        </div>

        <Separador Titulo="Contacto Principal" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className='col-span-1'>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="Nombre"
              value={formState.ContactoPrincipal?.Nombre}
              onChange={(e) => handleNestedInputChange('ContactoPrincipal', e)}
              className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className='col-span-1'>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              type="tel"
              name="Telefono"
              value={formState.ContactoPrincipal?.Telefono}
              onChange={(e) => handleNestedInputChange('ContactoPrincipal', e)}
              className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className='col-span-1'>
            <label className="block text-sm font-medium text-gray-700">Correo</label>
            <input
              type="email"
              name="Correo"
              value={formState.ContactoPrincipal?.Correo}
              onChange={(e) => handleNestedInputChange('ContactoPrincipal', e)}
              className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

        </div>

        <Separador Titulo="Contribuyentes asociados" />
        <div style={{ marginTop: "-10px" }}>
          <div className="p-4 bg-gray-100 font-sans">
            <div className="mt-4">
              <div className='grid grid-cols-1 gap-4'>
                <div className="flex justify-between">
                  <button
                    onClick={() => setIsOpenNuevoContribuyente(true)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded-full transition-colors duration-200">
                    Nuevo Contribuyente
                  </button>

                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded-full transition-colors duration-200">
                    Asociar Contribuyente
                  </button>
                </div>
                <table className="table-auto w-full border-collapse">
                  <tbody className="">
                    {clientesAsociados.length > 0 ? (
                      clientesAsociados.map((item) => (
                        <tr key={item._id} className="border-t border-gray-300 last:border-b">
                          <td className="px-4 py-2 text-gray-800">{item.RazonSocial}</td>
                          <td className="px-4 py-2 text-right">
                            <button
                              onClick={() => ValidarEliminarContribuyente(item._id || "")}
                              className="text-red-500 hover:text-red-700 font-bold transition-colors duration-200">
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-2 text-gray-500 italic" colSpan={2}>No hay contribuyentes asociados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>



            {/* Modal de Búsqueda */}
            {isModalOpen && (
              <ModalBuscarContribuyentes
                multiple={true}
                onChange={CerrarModalContribuyente}
              />
            )}
            {isOpenContador && (
              <ModalBuscarContador
                multiple={false}
                onChange={CerrarModalContador}
              />
            )}
            {isOpenNuevoContribuyente && (
              <AccesoContribuyentesAgregar
                onChange={AgregarNuevoContribuyente}
              />
            )}
            {OpenPreguntaEliminar && (
              <ModalPregunta
                Pregunta="¿Está seguro de eliminar el contribuyente?"
                Cerrar={CerrarEliminarContribuyente}
              />
            )}
            {OpenPreguntaContador && (
              <ModalPregunta
                Pregunta={`¿Está seguro de cambiar el contador asignado?`}
                Cerrar={CerrarModalPreguntaContador}  
              />
            )}

          </div>



        </div>

        <br />
        <div className="flex justify-end">
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
      <ModalMotivos
        Visible={isOpenMotivos}
        Mensaje="Por favor, ingrese el motivo de la reasignación"
        Cerrar={CerrarMotivo}
      />
      <MensajeNotificacion {...notification} hideNotification={hideNotification} />
    </div>
  );
};


export default GruposEmpresarialesAgregar
