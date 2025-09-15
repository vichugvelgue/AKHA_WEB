import React, { useState, useEffect, useMemo } from "react";
import MensajeNotificacion from "@/src/hooks//MensajeNotificacion";
import { useNotification } from "@/src/hooks/useNotifications";
import { CalculoFiscal, CalculoImpuesto, Impuesto } from "@/src/Interfaces/Interfaces";
import { API_BASE_URL } from "@/src/utils/constantes";
import ModalAgregarImpuesto from "./modalAgregarImpuesto";
import ModalCicloFiscal from "./modalCicloFiscal";
import { createPrerenderParamsForClientSegment } from "next/dist/server/app-render/entry-base";

interface ModalMotivosProps {
  Visible: boolean;
  idEditar: string;
  Cerrar: (exito: string) => void; // callback al cambiar
}

export default function CalculosFiscales({ Visible, idEditar = "", Cerrar }: ModalMotivosProps) {
  if (!Visible) return null;
  const { notification, showNotification, hideNotification } = useNotification();
  const [showNuevoImpuesto, setShowNuevoImpuesto] = useState<boolean>(false);
  const [showCicloFiscal, setCicloFiscal] = useState<boolean>(false);
  const [loading, setloading] = useState<boolean>(false);
  const [Nuevo, setNuevo] = useState<boolean>(false);
  const [Fecha, setFecha] = useState<string>("");
  const [Ciclo, setCiclo] = useState<Number>(0);
  const [Calculo, setCalculo] = useState<CalculoFiscal>({
    Impuestos: [],
    FechaCalculo: new Date(),
    idCliente: idEditar,
  });
  const [Impuestos, setImpuestos] = useState<Impuesto[]>([]);

  useEffect(() => {
    ObtenerImpuestos();
    const ahora = new Date();
    setCiclo(ahora.getFullYear());          // ✅ Año actual
    setFecha(ahora.toISOString().substring(0, 7)); // YYYY-MM
    NuevoCalculo();
  }, []);

  useEffect(() => {
    BuscarPorMes();
  }, [Fecha]);
  
  const ObtenerImpuestos = async () => {
    setloading(true);
    try {
      const respuesta = await fetch(`${API_BASE_URL}/impuestos/ObtenerPorCliente/${idEditar}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await respuesta.json();

      if (respuesta.ok) {
        setImpuestos(data.data)
      } else {
        showNotification(data.mensaje, "error")
      }
      setloading(false);
    } catch {
      setloading(false);
      showNotification("Ocurrio un error, intentelo mas tarde", "error")
    }
  }

  const BuscarPorMes = async () => {
    setloading(true);
    try {
      if (!Fecha) return
      let [ciclo, mes] = Fecha.split("-").map(Number);
      const respuesta = await fetch(`${API_BASE_URL}/calculosFiscales/BuscarPorMesCliente`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: "POST",
        body: JSON.stringify({
          idCliente: idEditar,
          Mes: mes,
          Ciclo: ciclo,
        }),
      })
      const data = await respuesta.json();

      if (respuesta.ok) {
        debugger
        if (data.data) {
          setNuevo(false);
          setCalculo(data.data)
        } else {
          NuevoCalculo()
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

  const SeleccionarFecha = (e: React.ChangeEvent<HTMLInputElement>) => {
    var { name, value } = e.target;
    if (name == "fecha") {
      const [ciclo, mes] = Fecha.split("-").map(Number);
      setCiclo(ciclo)
      setFecha(value);
    }
  }
  const NuevoCalculo = () => {
    const [ciclo, mes] = Fecha.split("-").map(Number);

    let baseImpuestos = [
      { idImpuesto: "ISR", Nombre: "ISR" },
      { idImpuesto: "ISR Retencion", Nombre: "ISR Retención" },
      { idImpuesto: "IVA", Nombre: "IVA" },
      { idImpuesto: "IVA Retencion", Nombre: "IVA Retención" },
      { idImpuesto: "ISN", Nombre: "ISN" },
    ].map(item => ({
      ...item,
      Monto: 0,
      observaciones: ""
    }));

    // fusionar con Impuestos de cliente
    let ListaImpuestos = [...baseImpuestos];
    for (let item of Impuestos) {
      if (!ListaImpuestos.find(x => x.idImpuesto == item._id)) {
        ListaImpuestos.push({
          idImpuesto: item._id ?? "",
          Nombre: item.Nombre,
          Monto: 0,
          observaciones: ""
        });
      }
    }

    setNuevo(true);
    setCalculo({
      _id: undefined,
      idCliente: idEditar,
      FechaCalculo: new Date(ciclo, mes - 1, 1, 12, 0),
      Impuestos: ListaImpuestos,
    });
  };

  const CambiarValorCalculo = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { name, value, type } = e.target;
    let Impuestos = [...Calculo.Impuestos ?? []];
    if (name == "Monto") {
      Impuestos[index].Monto = Number(value);
      setCalculo({
        ...Calculo,
        Impuestos,
      })
    }
    else {
      Impuestos[index].observaciones = value;
      setCalculo({
        ...Calculo,
        Impuestos,
      })
    }
  }
  const ValidarCampos = () => {
    let Validar = true;

    // Calculo.Impuestos?.forEach(item => {
    //   if (item.Monto == 0) {
    //     Validar = false;
    //     showNotification("El monto es requerido en todos los impuestos", "error")
    //   }
    // });

    return Validar;
  }
  const Guardar = async () => {
    if (!ValidarCampos()) return

    setloading(true);
    try {
      let body = {
          _id:null,
        ...Calculo,
        FechaCalculo: Fecha + "-01T12:00",
      }
      const respuesta = await fetch(`${API_BASE_URL}/calculosFiscales/Guardar`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: "POST",
        body: JSON.stringify(body),
      })
      const data = await respuesta.json();

      if (respuesta.ok) {
        showNotification(data.mensaje, "success")
        Cerrar("success");
      } else {
        showNotification(data.mensaje, "error")
      }
      setloading(false);
    } catch {
      setloading(false);
      showNotification("Ocurrio un error, intentelo mas tarde", "error")
    }
  }
  const CerrarModalAgregarImpuesto = (impuesto: Impuesto | null) => {
    setShowNuevoImpuesto(false);
    if (impuesto) {
      setCalculo({
        ...Calculo,
        Impuestos: [...Calculo.Impuestos ?? [], 
        {
          idImpuesto: impuesto._id,
          Monto: 0,
          Nombre: impuesto.Nombre,
          observaciones: "",
        },],
      })
    }
  }
  const CerrarModalCicloFiscal = () => {
    setCicloFiscal(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
    >
      <div className="w-full max-w-4xl max-h-[90dvh] overflow-auto rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 scale-100 ">
        <div className="text-2xl font-bold text-blue-900">
          Calculos Fiscales
        </div>
        <br />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="">
            <label htmlFor="nombreFilter" className="block text-sm font-medium text-gray-700">Seleccionar mes y año</label>
            <input
              type="month"
              name="fecha"
              id="fecha"
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={Fecha}
              onChange={SeleccionarFecha}
            />
          </div>
          <div className="">
              <button className="mt-3 inline-block rounded-md bg-yellow-600 px-4 py-1 text-white transition-colors hover:bg-yellow-700"
               onClick={() => setCicloFiscal(true)}>
                Ver año fiscal
              </button>
          </div>
          <div className="grid justify-items-end">
            {Nuevo &&
              <button className="mt-3 inline-block rounded-md bg-yellow-600 px-4 py-1 text-white transition-colors hover:bg-yellow-700"
               onClick={() => setShowNuevoImpuesto(true)}>
                Nuevo impuesto
              </button>
            }
          </div>
        </div>
        <br />

        <div className={`w-full max-w-4xl rounded-2xl bg-gray-100 p-8`}>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left px-4 py-2">Impuesto</th>
                <th className="px-4 py-2">Monto</th>
                <th className="px-4 py-2">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {
                Calculo.Impuestos?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">{item.Nombre}</td>
                    <td className="text-center px-4 py-2">
                      <input
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        name="Monto"
                        value={item.Monto}
                        onChange={(e) => CambiarValorCalculo(e, index)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        name="observaciones"
                        value={item.observaciones}
                        onChange={(e) => CambiarValorCalculo(e, index)}
                      /></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={() => Cerrar("")} className="rounded-md bg-gray-300 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-400">
            Cancelar
          </button>
          {Nuevo &&
            <button onClick={Guardar} className="rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
              Aceptar
            </button>
          }
        </div>

      </div>
      <ModalCicloFiscal
        Visible={showCicloFiscal}
        Ciclo={Number(Ciclo)}
        idEditar={idEditar}
        Cerrar={CerrarModalCicloFiscal}
      />
      <ModalAgregarImpuesto
        Visible={showNuevoImpuesto}
        idContribuyente={idEditar}
        Cerrar={CerrarModalAgregarImpuesto}
      />
      <MensajeNotificacion {...notification} hideNotification={hideNotification} />
    </div>
  );
}