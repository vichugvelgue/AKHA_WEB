import { useState, useEffect } from "react";
import { Cliente } from "../Interfaces/Interfaces";
import { API_BASE_URL } from "../utils/constantes";
import ContribuyentesAgregar from "../app/dashboard/administracion/contribuyentes/Agregar";

interface AccesoContribuyentesAgregarProps {
    onChange: (value: boolean | Cliente) => void; // callback al cerrar el modal
}

export default function AccesoContribuyentesAgregar({ onChange }: AccesoContribuyentesAgregarProps) {
    useEffect(() => { }, [])

    const addContribuyente = (Mensaje: string, Color: "success" | "error" | "warning", contribuyente: Cliente) => {
        onChange(contribuyente)
    }
    const handleCloseModal = (guardar: boolean = false) => {
        onChange(false);
    }


    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
        >
            <div className="w-full max-w-7xl max-h-[90dvh] overflow-auto rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 scale-100 ">
                <ContribuyentesAgregar
                    Editar={false}
                    onClose={handleCloseModal}
                    onRegister={addContribuyente}
                />
            </div>
        </div>
    );
}