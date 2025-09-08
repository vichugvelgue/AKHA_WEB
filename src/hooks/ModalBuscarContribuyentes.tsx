import { useState, useEffect } from "react";
import { Cliente } from "../Interfaces/Interfaces";
import { API_BASE_URL } from "../utils/constantes";

interface ModalBuscarContribuyentesProps {
    multiple?: boolean;
    onChange: (value: boolean |null | Cliente | Cliente[]) => void; // callback al cambiar
}
interface SeleccionCliente {
    _id: string;
    RazonSocial: string;
    Seleccionado?: boolean;
}


export default function ModalBuscarContribuyentes({ multiple, onChange }: ModalBuscarContribuyentesProps) {
    const [ListaContribuidores, setListaContribuidores] = useState<SeleccionCliente[]>([])
    const [NombreBuscar, setNombreBuscar] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")

    useEffect(() => {

    }, [])

    const Buscar = async () => {
        setIsLoading(true);
        setListaContribuidores([]);
        try {
            const response = await fetch(`${API_BASE_URL}/clientes/BuscarClientes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    RazonSocial: NombreBuscar,
                    RFC: "",
                } as Cliente),
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            // Se añade un manejo de errores más robusto al intentar parsear la respuesta
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                setListaContribuidores(data.data);
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
    const addContribuyente = (contribuyente: SeleccionCliente) => {
        let lista = [...ListaContribuidores]

        if(!multiple){
            for (let cliente of lista) {
                cliente.Seleccionado = false;
            }
        }
        let index = lista.findIndex((item) => item._id == contribuyente._id)
        if (index >= 0){
            lista[index].Seleccionado = !contribuyente.Seleccionado
        }

        setListaContribuidores(lista)
    }
    const handleCloseModal = (guardar: boolean = false) => {
        if (!guardar) onChange(false);

        if (multiple) {
            let lista = ListaContribuidores.filter(item => item.Seleccionado).map(item => (item as Cliente));  
            onChange(lista)
        } else {
            let item = ListaContribuidores.find(item => item.Seleccionado) 
            onChange((item as Cliente))
        }
    }


    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
        >
            <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl transform transition-transform duration-300 border-2 border-blue-500 scale-100">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">Buscar Contribuyente</h3>
                    <button onClick={() => handleCloseModal(false)} className="text-gray-400 transition-colors duration-200 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mt-6 grid grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={NombreBuscar}
                        onChange={(e) => setNombreBuscar(e.target.value)}
                        className="col-span-3 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={Buscar} className="col-auto rounded-md bg-blue-600 text-white transition-colors duration-200 hover:bg-blue-700">Buscar</button>
                </div>
                <div className="mt-6 space-y-4">
                    {isLoading && (
                        <p className="mt-4 text-center text-gray-500">Cargando...</p>
                    )}

                    {ListaContribuidores.length > 0 && (
                        <ul className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                            {ListaContribuidores.map((contribuyente) => (
                                <li className={`p-3 cursor-pointer border-b last:border-b-0 ${!contribuyente.Seleccionado ? "border-gray-200  hover:bg-gray-100" : "bg-blue-500 hover:bg-blue-700"}`}
                                    key={contribuyente._id} onClick={() => addContribuyente(contribuyente)}>
                                    {contribuyente.RazonSocial}
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* {NombreBuscar.length > 2 && ListaContribuidores.length === 0 && (
                        <p className="mt-4 text-center text-gray-500">No se encontraron resultados.</p>
                    )} */}
                </div>

                <div className="mt-6 flex justify-end">
                    <button className="rounded-md bg-gray-300 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-400"
                        onClick={() => handleCloseModal(true)} >
                        Seleccionar
                    </button>
                </div>
            </div>
        </div>
    );
}