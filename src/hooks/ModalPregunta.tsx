import { useState, useEffect } from "react";
import { Cliente, Bitacora } from "../Interfaces/Interfaces";
import { API_BASE_URL, ZONA_HORARIA } from "../utils/constantes";

interface ModalPreguntaProps {
    Pregunta: string;
    Cerrar: (exito:boolean) => void; // callback al cambiar
}

export default function ModalPregunta({ Pregunta="", Cerrar }: ModalPreguntaProps) {

    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 opacity-100 backdrop-blur-sm}`}
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
      >
        <div className={`w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 scale-100`}>
          <p className="text-lg font-semibold text-gray-800">{Pregunta}</p>
          <div className="mt-4 flex justify-end space-x-2">
            <button onClick={() => Cerrar(false)} className="rounded-md bg-red-300 px-4 py-2 text-gray-800 transition-colors hover:bg-red-400">
              Cancelar
            </button>
            <button onClick={() => Cerrar(true)} className="rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700">
              Aceptar
            </button>
          </div>
        </div>
      </div>
    );
}