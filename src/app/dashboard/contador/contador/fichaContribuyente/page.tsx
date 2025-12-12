"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importa el hook useRouter
import CalculosFiscales from './calculosFiscales/calculosFiscales';
import ResumenesEjecutivos from './resumenEjecutivo/resumenesjecutivos';
import RegistroPagos from './registroPagos/registropagos'
import { useNotification } from '@/src/hooks/useNotifications';
import MensajeNotificacion from "@/src/hooks//MensajeNotificacion";
import { API_BASE_URL } from '@/src/utils/constantes';
import { Cliente } from '@/src/Interfaces/Interfaces';
import Cargando from '@/src/hooks/Cargando';
import HistoricoSaldoFavor from './historicoSaldosFavor/historicoSaldoFavor'
import ActividadesCRUD from './actividades/listaActividades';

const defaultContacto = {
  Nombre: "",
  Telefono: "",
  Correo: "",
}
// Se utiliza un solo componente para contener toda la lógica y la interfaz.
const App = () => {
  const router = useRouter();
  const { notification, showNotification, hideNotification } = useNotification();
  // Estado para simular la información del contribuyente
  const [contribuyente, setContribuyente] = useState<Cliente>({
    RazonSocial: '.',
    RFC: '',
    CorreoElectronico: '',
    ServiciosSeleccionados: [],
    RepresentanteLegal: { Nombre: '', RFC: '', Alias: '', Cumpleanos: '' },
    DuenoEmpresa: defaultContacto,
    ContactoCobranza: defaultContacto,
    GerenteOperativo: defaultContacto,
    EnlaceAkha: defaultContacto,
    Cumpleanos: "",
    ActividadesSeleccionadas: [],
    ServiciosContribuyente: [],
  });

  // Estado para la visibilidad de las secciones (simulando los componentes anidados)
  const [openSection, setOpenSection] = useState<'none' | 'calculos' | 'resumen'>('none');
  const [idEditar, setIdEditar] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(false);

  // Estados para los modales
  const [OpenCalculosFiscales, setOpenCalculosFiscales] = useState(false);
  const [OpenResumenEjecutivo, setOpenResumenEjecutivo] = useState(false);
  const [OpenRegistroPagos, setOpenRegistroPagos] = useState(false);
  const [OpenHistoricoSaldos, setOpenHistoricoSaldos] = useState(false);
  const [OpenActividades, setOpenActividades] = useState(false);


  // Simula la carga de datos del contribuyente al inicio
  useEffect(() => {
    // Aquí iría tu lógica real para obtener la información del contribuyente
    // basado en el ID, por ejemplo:
    const idContribuyente = localStorage.getItem("idContribuyente");
    setIdEditar(idContribuyente || "");
    ObtenerContribuyente(idContribuyente || "")
  }, []);
  const ObtenerContribuyente = async (idEditar: string) => {
    setCargando(true);
    try {
      const response = await fetch(`${API_BASE_URL}/clientes/ObtenerCliente/${idEditar}`);
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setContribuyente(data.data);
      } else {
        const text = await response.text();
        console.error('La respuesta de la API no es JSON:', text);
        throw new Error('La API no devolvió un formato JSON válido.');
      }
    } catch (err: any) {
      console.error('Error al obtener el cliente:', err);
      // setError(err.message || 'Hubo un error al cargar el cliente. Verifica que la API esté corriendo.');
    } finally {
      setCargando(false);
    }
  };

  // Lógica para abrir y cerrar modales (copiada de tu código)
  const AbrirCalculosFiscales = (id: string = "") => {
    setOpenCalculosFiscales(true);
  };
  const CerrarCalculosFiscales = (exist: string) => {
    setOpenCalculosFiscales(false);
    if (exist === "success") {
      showNotification("Calculos fiscales guardados correctamente", "success");
    }
  };
  const AbrirResumenEjectutivo = (id: string = "") => {
    setOpenResumenEjecutivo(true);
  };
  const CerrarResumenEjectutivo = (exist: string) => {
    setOpenResumenEjecutivo(false);
    if (exist === "success") {
      showNotification("Resumen ejectutivo guardado correctamente", "success");
    }
  };

  const AbrirRegistroPagos = (id: string = "") => {
    // setIdEditar(id);
    setOpenRegistroPagos(true);
  };
  const CerrarRegistroPagos = (exist: string) => {
    setOpenRegistroPagos(false);
    if (exist === "success") {
      showNotification("Registro de pagos guardado correctamente", "success");
    }
  };
  const AbrirHistoricoSaldos = () => {
    setOpenHistoricoSaldos(true);
  };
  const CerrarHistoricoSaldos = (exist: string) => {
    setOpenHistoricoSaldos(false);
    if (exist === "success") {
      showNotification("Registro de pagos guardado correctamente", "success");
    }
  };
  const AbrirActividades = () => {
    setOpenActividades(true);
  };
  const CerrarActividades = (exist: string) => {
    setOpenActividades(false);
    if (exist === "success") {
      showNotification("Registro de pagos guardado correctamente", "success");
    }
  };

  // Datos para el menú, siguiendo el estilo de la página principal
  const menuOptions = [
    { id: 'calculos', icon: '📝', text: 'Cálculos Fiscales', onClick: () => AbrirCalculosFiscales(idEditar) },
    { id: 'resumen', icon: '📊', text: 'Resumen Ejecutivo', onClick: () => AbrirResumenEjectutivo(idEditar) },
    { id: 'pagos', icon: '💳', text: 'Registro de Pagos', onClick: () => AbrirRegistroPagos(idEditar) },
    { id: 'Saldos', icon: '💵', text: 'Saldos a favor', onClick: () => AbrirHistoricoSaldos() },
    { id: 'Actividades', icon: '📋', text: 'Actividades', onClick: () => AbrirActividades() },
    { id: 'documentos', icon: '📁', text: 'Documentos', onClick: () => console.log('Abriendo Documentos') },
    { id: 'bitacora', icon: '🗒️', text: 'Bitácora', onClick: () => console.log('Abriendo Bitácora') },
    { id: 'historial', icon: '🕒', text: 'Historial de Pagos', onClick: () => console.log('Abriendo Historial de Pagos') },
  ];

  // Renderiza el contenido del modal
  const renderModalContent = (section: 'calculos' | 'resumen') => {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
      >
        <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-indigo-600 scale-100">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">{section === 'calculos' ? 'Cálculos Fiscales' : 'Resumen Ejecutivo'}</h3>
            <button
              onClick={() => section === 'calculos' ? CerrarCalculosFiscales('') : CerrarResumenEjectutivo('')}
              className="text-gray-400 transition-colors duration-200 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-6">
            <p className="text-gray-700">Contenido del modal de {section === 'calculos' ? 'Cálculos Fiscales' : 'Resumen Ejecutivo'}.</p>
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={() => section === 'calculos' ? CerrarCalculosFiscales('success') : CerrarResumenEjectutivo('success')}
              className="rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
            >
              Guardar y Cerrar
            </button>
            <button
              onClick={() => section === 'calculos' ? CerrarCalculosFiscales('') : CerrarResumenEjectutivo('')}
              className="rounded-md bg-gray-300 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-400"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (OpenActividades) {
    return <ActividadesCRUD idContribuyente={idEditar} Cerrar={CerrarActividades} />
  } else if (OpenHistoricoSaldos) {
    return <HistoricoSaldoFavor idContribuyente={idEditar} Cerrar={CerrarHistoricoSaldos} />
  }

  return (
    <div className="p-4 bg-gray-100 font-sans min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extrabold text-blue-900">Ficha del Contribuyente</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => router.push(`/dashboard/contador/contador/`)}
              className="rounded-lg bg-gray-300 px-6 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-400"
            >
              Regresar
            </button>
          </div>
        </div>

        {/* Información del contribuyente con estilo de tarjeta */}
        <div className="rounded-xl bg-white p-6 shadow-md border-t-4 border-indigo-600">
          <h3 className="text-xl font-bold mb-2">{contribuyente.RazonSocial}</h3>
          <p className="text-gray-600">RFC: <span className="font-semibold">{contribuyente.RFC}</span></p>
          <p className="text-gray-600">Email: <span className="font-semibold">{contribuyente.CorreoElectronico}</span></p>
        </div>

        {/* Sección principal del menú */}
        <div className="overflow-x-auto rounded-xl bg-white p-6 shadow-md">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {menuOptions.map((option) => (
              <button
                key={option.id}
                onClick={option.onClick}
                className="group flex transform cursor-pointer flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-lg transition-all duration-300 hover:scale-105 hover:bg-indigo-600 hover:text-white hover:shadow-2xl"
              >
                <div className="mb-4 text-5xl transition-transform duration-300 group-hover:scale-110">
                  {option.icon}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-white">{option.text}</h2>
              </button>
            ))}
          </div>
        </div>

        {/* Modales */}
        {OpenCalculosFiscales && <CalculosFiscales Visible={OpenCalculosFiscales} idEditar={idEditar} Cerrar={CerrarCalculosFiscales} />}
        {OpenResumenEjecutivo && <ResumenesEjecutivos Visible={OpenResumenEjecutivo} idEditar={idEditar} Cerrar={CerrarResumenEjectutivo} />}
        {OpenRegistroPagos && <RegistroPagos Visible={OpenRegistroPagos} idEditar={idEditar} Cerrar={CerrarRegistroPagos} />}
        <MensajeNotificacion  {...notification} hideNotification={hideNotification} />
        <Cargando isLoading={cargando} />
      </div>
    </div>
  );
};

export default App;
