// app/dashboard/administracion/usuarios/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importa el hook useRouter
import ToggleSwitch from "@/src/hooks/ToggleSwitch";
import Cargando from '@/src/hooks/Cargando';
import { useNotification } from '@/src/hooks/useNotifications';
import { Modulo, Permiso, TipoUsuario, Cliente } from '@/src/Interfaces/Interfaces';
import { ObtenerSesionUsuario } from '@/src/utils/constantes';
import ModalBitacoraContibuyente from '@/src/hooks/ModalBitacoraContibuyente';
import CalculosFiscales from './calculosFiscales/calculosFiscales';
import ResumenesEjecutivos from './resumenEjecutivo/resumenesjecutivos';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';


// Componente para la vista de CRUD de Usuarios
export default function FichaContribuyente() {
  // Inicializa el router para la navegación
  const router = useRouter();
  const sesion = ObtenerSesionUsuario();
  const { notification, showNotification, hideNotification } = useNotification();

  const [OpenCalculosFiscales, setOpenCalculosFiscales] = useState(false);
  const [OpenResumenEjecutivo, setOpenResumenEjecutivo] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [idEditar, setIdEditar] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pregunta, setPregunta] = useState<string>("");


  useEffect(() => {
    let idContribuyente = localStorage.getItem("idContribuyente");
    setIdEditar(idContribuyente || "");
  }, []);

  const AbrirCalculosFiscales = (id: string = "") => {
    setIdEditar(id);
    setOpenCalculosFiscales(true);
  };
  const CerrarCalculosFiscales  = (exist: string) => {
    setOpenCalculosFiscales(false);
    if(exist == "success"){
      showNotification("Calculos fiscales guardados correctamente", "success");
    }
  };
  const AbrirResumenEjectutivo = (id: string = "") => {
    setIdEditar(id);
    setOpenResumenEjecutivo(true);
  };
  const CerrarResumenEjectutivo  = (exist: string) => {
    setOpenResumenEjecutivo(false);
    if(exist == "success"){
      showNotification("Resumen ejectutivo guardado correctamente", "success");
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-blue-900">Ficha del Contribuyente</h2>

        <div className="flex space-x-4">
          <button
            onClick={() => {
              router.push('/dashboard/contador/contador/');
            }}
            className="rounded-lg bg-gray-300 px-6 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-400"
          >
            Regresar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white p-6 shadow-md">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-left text-gray-700 ">
              <th className="px-4 py-2 "></th>
              <th className=" px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
              <tr className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2">Calculos Fiscales</td>
                <td className="px-4 py-2 flex justify-end space-x-2 ">
                  <button onClick={()=>AbrirCalculosFiscales(idEditar)} className="rounded-md bg-blue-600 px-4 py-1 text-sm text-white transition-colors duration-200 hover:bg-blue-700">
                    <i className="material-symbols-rounded filled">stylus</i>
                  </button>
                </td>
              </tr>
              <tr className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2">Resumen ejecutivo</td>
                <td className="px-4 py-2 flex justify-end space-x-2 ">
                  <button onClick={()=>AbrirResumenEjectutivo(idEditar)} className="rounded-md bg-blue-600 px-4 py-1 text-sm text-white transition-colors duration-200 hover:bg-blue-700">
                    <i className="material-symbols-rounded filled">stylus</i>
                  </button>
                </td>
              </tr>
          </tbody>
        </table>
      </div>

      {OpenCalculosFiscales && <CalculosFiscales Visible={OpenCalculosFiscales} idEditar={idEditar} Cerrar={CerrarCalculosFiscales} />}
      {OpenResumenEjecutivo && <ResumenesEjecutivos Visible={OpenResumenEjecutivo} idEditar={idEditar} Cerrar={CerrarResumenEjectutivo} />}
      
      {/* Modal de confirmación de eliminación con animación */}
      {showConfirm && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 opacity-100 backdrop-blur-sm}`}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
        >
          <div className={`w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 scale-100`}>
            <p className="text-lg font-semibold text-gray-800">{pregunta}</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={()=>{}} className="rounded-md bg-gray-300 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-400">
                Cancelar
              </button>
              <button onClick={()=>{}} className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      <Cargando isLoading={isLoading} />
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

