import { useState, useEffect } from "react";
import { Cliente, Bitacora } from "../Interfaces/Interfaces";
import { API_BASE_URL, ZONA_HORARIA } from "../utils/constantes";

interface ModalBitacoraContibuyenteProps {
    idContribuyente: string;
    Cerrar: () => void; // callback al cambiar
}

export default function ModalBitacoraContibuyente({  idContribuyente, Cerrar }: ModalBitacoraContibuyenteProps) {
    const [ListaBitacora, setListaBitacora] = useState<Bitacora[]>([])
    const [NombreBuscar, setNombreBuscar] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")

    useEffect(() => {
        Buscar();
    }, [])

    const Buscar = async () => {
        setIsLoading(true);
        setListaBitacora([]);
        try {
            const response = await fetch(`${API_BASE_URL}/bitacoras/ObtenerBitacoraCliente/${idContribuyente}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            // Se añade un manejo de errores más robusto al intentar parsear la respuesta
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                data.data.forEach((item:any) => {
                    item.idUsuarioAplico = item.idUsuarioAplico.NombreCompleto
                })
                setListaBitacora(data.data);
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
    const FormatearFecha = (fecha: Date) => {
        let fechaFormateada = fecha.toLocaleString('es-MX', {
            timeZone: ZONA_HORARIA,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        })
        return fechaFormateada
    }


    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
        >
            <div className="w-full max-w-4xl rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 scale-100">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">Bitacora de contribuyente</h3>
                    <button onClick={Cerrar} className="text-gray-400 transition-colors duration-200 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <br />
                <div className="max-h-[500px] overflow-y-auto border border-gray-400">
                    <table className="border-collapse border border-gray-400 w-full">
                        <thead className="bg-gray-100">
                            <tr className="border border-gray-300">
                                <th className="text-left p-4">Fecha</th>
                                <th className="text-center p-4">Usuario</th>
                                <th className="text-center p-4">Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={2} className="text-center p-2">Cargando...</td>
                                </tr>
                            )}
                            {ListaBitacora.map((contribuyente) => (
                                <tr key={contribuyente._id} className="hover:bg-gray-100 border border-gray-300">
                                    <td className="text-left p-2">
                                        {`${FormatearFecha(new Date(contribuyente.Fecha?.toString() ?? "1900-01-01"))} ${contribuyente.Hora}`}
                                    </td>
                                    <td className="text-center p-2">{contribuyente?.idUsuarioAplico}</td>
                                    <td className="text-center p-2">{contribuyente?.Descripcion}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>


                <div className="mt-6 flex justify-end">
                    <button className="rounded-md bg-gray-300 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-400"
                        onClick={Cerrar} >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}