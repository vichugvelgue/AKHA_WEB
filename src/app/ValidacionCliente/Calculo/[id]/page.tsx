'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_BASE_URL, ObtenerSesionUsuario } from '@/src/utils/constantes';
import Cargando from '@/src/hooks/Cargando';
import { CalculoFiscal, ValidacionCalculoFiscal } from '@/src/Interfaces/Interfaces';
import { EstatusValidacion } from "@/src/Interfaces/enums";
import { useNotification } from '@/src/hooks/useNotifications';
import MensajeNotificacion from '@/src/hooks/MensajeNotificacion';
import ModalPregunta from '@/src/hooks/ModalPregunta';
import ConfirmacionPage from '@/src/hooks/ConfirmacionPage';

interface Error {
  EstadoAceptacion: boolean;
  Evidencia: boolean;
  MotivosRechazo: boolean;
}

export default function ValidacionCalculoPage() {
    const params: { id: string } = useParams();
    const Router = useRouter()
    const { notification, showNotification, hideNotification } = useNotification()

    const [Validacion, setValidacion] = useState<ValidacionCalculoFiscal>({
        EstadoAceptacion: EstatusValidacion.Pendiente,
        Fecha: new Date(),
        idCliente: "",
        idCalculo: params.id,
    });
  const [Error, setError] = useState<Error>({
    EstadoAceptacion:false,
    Evidencia:false,
    MotivosRechazo:false,
  });
    const [loading, setloading] = useState(false);
    const [Exito, setExito] = useState(false);
    const [Calculo, setCalculo] = useState<CalculoFiscal | null>(null);
    const [EstadoValidacion, setEstadoValidacion] = useState<EstatusValidacion>(EstatusValidacion.Pendiente);

    useEffect(() => {
        if (!params.id) Router.push("https://www.google.com/")
        Iniciar()
    }, []);
    const Iniciar = async () => {
        await BuscarAutorizacion(params.id)
        await BuscarPorId()
    }
    const BuscarPorId = async () => {
        setloading(true);
        try {
            const respuesta = await fetch(`${API_BASE_URL}/calculosFiscales/BuscarPorId/${params.id}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const data = await respuesta.json();

            if (respuesta.ok) {
                if (data.data) {
                    setCalculo(data.data)
                    let idCliente = (data.data as CalculoFiscal).idCliente
                    setValidacion({
                        ...Validacion,
                        idCliente,
                    })
                }
            }
            setloading(false);
        } catch {
            setloading(false);
            showNotification("Ocurrio un error, intentelo mas tarde", "error")
        }
    }
    const BuscarAutorizacion = async (idCalculo: string) => {
        setloading(true);
        try {
            const respuesta = await fetch(`${API_BASE_URL}/validacioncalculofiscal/BuscarPorCalculo/${idCalculo}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const data = await respuesta.json();

            if (respuesta.ok) {
                if (data.data) {
                    let status = data.data.EstadoAceptacion as EstatusValidacion
                    setEstadoValidacion(status);
                    if (status == EstatusValidacion.Autorizado) Router.push("https://www.google.com/")
                } else {
                    setEstadoValidacion(EstatusValidacion.Pendiente);
                }
            } else {
                showNotification(data.mensaje, "error")
            }
            setloading(false);
        } catch {
            setloading(false);
            showNotification("Ocurrio un error, intentelo mas tarde", "error")
        }
    }
  const ValidarCampos = () => {
    let Validar = true;
    let error: Error = {
      EstadoAceptacion: false,
      MotivosRechazo: false,
      Evidencia: false,
    }

    if (Validacion.EstadoAceptacion == EstatusValidacion.Pendiente) {
      error.EstadoAceptacion = true
      Validar = false;
    } else if (Validacion.EstadoAceptacion == EstatusValidacion.Rechazado) {
      if (!Validacion.MotivosRechazo) {
        error.MotivosRechazo = true
        Validar = false;
      }
    }

    if(!Validar){
      showNotification("Complete todos lo campos", "error")
    }

    setError(error)
    return Validar;
  }
  const Guardar = async () => {
    if (!ValidarCampos()) return

    setloading(true);
    try {
      let body = {
        _id: null,
        ...Validacion,
      }
      const respuesta = await fetch(`${API_BASE_URL}/validacioncalculofiscal/Guardar`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: "POST",
        body: JSON.stringify(body),
      })
      const data = await respuesta.json();

      if (respuesta.ok) {
        setExito(true)
      } else {
        showNotification(data.mensaje, "error")
      }
      setloading(false);
    } catch {
      setloading(false);
      showNotification("Ocurrio un error, intentelo mas tarde", "error")
    }
  }
    const convertirPesos = (numero: number) => {
        return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(numero)
    }

    const CambiarValor = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        var { name, value, type } = e.target;
        setValidacion({
            ...Validacion,
            [name]: value,
        })
    }

    if (Exito) {
        return <ConfirmacionPage Mensaje="Se registro validación correctamente" />;
    }
    if (loading) {
        return <Cargando isLoading={loading} />;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 backdrop-blur-sm text-black"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
        >
            <div className="w-full max-w-5xl max-h-[90dvh] overflow-auto rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 scale-100 ">
                <div className="text-2xl font-bold text-blue-900">
                    Calculo fiscal:  {Calculo?.FechaCalculo ? new Date(Calculo.FechaCalculo).toLocaleDateString("es-MX", { month: "long", year: "numeric" }) : ''}
                </div>
                <br />

                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="">
                        <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">Estado de aceptación</label>
                        <select
                            name="EstadoAceptacion"
                            className={`mt-1 block w-full rounded-md bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border-gray-300`}
                            value={Validacion.EstadoAceptacion}
                            onChange={CambiarValor}
                        >
                            <option disabled value={EstatusValidacion.Pendiente}>Pendiente</option>
                            <option value={EstatusValidacion.Rechazado}>Rechazado</option>
                            <option value={EstatusValidacion.Autorizado}>Autorizado</option>
                        </select>
                    </div>
                    {
                        Validacion.EstadoAceptacion == EstatusValidacion.Rechazado &&
                        <div className="col-span-2">
                            <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">Motivo de rechazo</label>
                            <textarea
                                name="MotivosRechazo"
                                className={`resize-y mt-1 block w-full rounded-md bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border-gray-300`}
                                value={Validacion.MotivosRechazo}
                                onChange={CambiarValor}
                                wrap='auto'
                            />
                        </div>
                    }
                </div>

                <div className={`w-full rounded-2xl bg-gray-100 p-8`}>
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="text-left px-4 py-2">Impuesto</th>
                                <th className="text-left px-4 py-2">Monto</th>
                                <th className="px-4 py-2">Observaciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                Calculo?.Impuestos?.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-2">{item.Nombre}</td>
                                        <td className="px-4 py-2">{convertirPesos(item.Monto || 0)}</td>
                                        <td className="text-justify px-4 py-2">{item.observaciones}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={Guardar} className="rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
                        Guardar
                    </button>
                </div>
            </div>
            <MensajeNotificacion {...notification} hideNotification={hideNotification} />
        </div>
    );
}