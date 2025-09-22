"use client";

import React, { useState, useEffect, ChangeEventHandler } from 'react';
// Interfaz para el tipo de datos de un usuario.
// idTipoUsuario ahora usa un tipo numérico para coincidir con el enum.
import { API_BASE_URL } from '@/src/utils/constantes';
import { useNotification } from '@/src/hooks/useNotifications';
import { Configuracion } from '@/src/Interfaces/Interfaces';
import Seperador from '@/src/hooks/Separador';
import Cargando from '@/src/hooks/Cargando';
import MensajeNotificacion from '@/src/hooks/MensajeNotificacion';
import { useRouter } from 'next/navigation';

const defaultError: Configuracion = {
  AutorizacionPagos: { DiaLimiteConfirmacionCalculo: 1 },
  Actividades: { DiasRecordatorio: 1 },
}
// Componente principal para la gestión de usuarios
const UserList = () => {
  const router = useRouter();
  const { notification, showNotification, hideNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [Configuracion, setConfiguracion] = useState<Configuracion>({
    AutorizacionPagos: { DiaLimiteConfirmacionCalculo: 1 },
    Actividades: { DiasRecordatorio: 1 },
  });
  const [error,setError]=useState<Configuracion>(defaultError);
  
  useEffect(() => {
    ObtenerConfiguracion()
  }, [])

  const ObtenerConfiguracion = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/configuraciones/Obtener`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(`Error: ${data.mensaje}`);

      setConfiguracion(data.data)
    } catch (err: any) {
      showNotification(err.message || 'Hubo un error al cargar configuracion. Verifica que la API esté corriendo y responda correctamente.', "error");
    } finally {
      setIsLoading(false)
    }
  }
  const ValidarDatos=()=>{
    let valido = true
    let err = { ...defaultError }; // copia nueva en cada validación

    if(!ValidarDiasMes(Configuracion.AutorizacionPagos.DiaLimiteConfirmacionCalculo)){
      valido = false
      err.AutorizacionPagos.DiaLimiteConfirmacionCalculo = 0
    }
    if(!ValidarDiasMes(Configuracion.Actividades.DiasRecordatorio)){
      valido = false
      err.Actividades.DiasRecordatorio= 0
    }

    if(!valido) showNotification("Complete los datos correctamente","error")

    setError(err)
    return valido
  }
  const Guardar = async () => {
    if (!ValidarDatos()) return

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/configuraciones/Guardar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Configuracion)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(`Error: ${data.mensaje}`);
    } catch (err: any) {
      showNotification(err.message || 'Hubo un error al cargar configuracion. Verifica que la API esté corriendo y responda correctamente.', "error");
    } finally {
      setIsLoading(false)
    }
  }
  const ValidarDiasMes=(dia:number)=>{
    return dia >= 1 && dia <=31
  }

  const CambiarValorAutorizacionPagos = (e: React.ChangeEvent<HTMLInputElement>) => {
    var { value, name, type } = e.target

    setConfiguracion({
      ...Configuracion,
      AutorizacionPagos: {
        ...Configuracion.AutorizacionPagos,
        [name]: parseInt(value),
      }
    })
  }
  const CambiarValorActividades = (e: React.ChangeEvent<HTMLInputElement>) => {
    var { value, name } = e.target

    setConfiguracion({
      ...Configuracion,
      Actividades: {
        ...Configuracion.Actividades,
        [name]: parseInt(value),
      }
    })
  }


console.log(error);

  return (
    <div className="space-y-6 p-4">
      {/* Componente de Notificación */}
      {notification.message && (
        <div className={`fixed top-4 right-4 z-[60] rounded-xl px-6 py-3 text-white shadow-xl transition-transform duration-300 transform ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-600'} ${notification.message ? 'translate-x-0' : 'translate-x-full'}`}>
          <p className="font-semibold">{notification.message}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-blue-900">Configuración</h2>
        
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
      {/* Formulario de búsqueda */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <Seperador Titulo="Autorización y pagos" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Día límite para la autorización del cálculo fiscal
            </label>
            <input
              type="number"
              name="DiaLimiteConfirmacionCalculo"
              value={Configuracion.AutorizacionPagos.DiaLimiteConfirmacionCalculo}
              min={1} max={31}
              onChange={CambiarValorAutorizacionPagos} 
              className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${error.AutorizacionPagos.DiaLimiteConfirmacionCalculo ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>
        </div>

        <Seperador Titulo="Actividades" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Anticipación del recordatorio (en días)
            </label>
            <input
              type="number"
              name="DiasRecordatorio"
              value={Configuracion.Actividades.DiasRecordatorio}
              onChange={CambiarValorActividades}
              className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${error.Actividades.DiasRecordatorio ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={Guardar} className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-700">
            Guardar
          </button>
        </div>
      </div>
      <Cargando isLoading={isLoading} />
      <MensajeNotificacion {...notification} hideNotification={hideNotification} />
    </div>
  );
};

export default function UserManagementPage() {
  return (
    <div className="p-10 flex-1 overflow-auto">
      <UserList />
    </div>
  );
}
