import { Modulo } from "../Interfaces/Interfaces";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
export const ZONA_HORARIA = process.env.NEXT_PUBLIC_ZONA_HORARIA || 'America/Mazatlan';
export const PORCENTAJE_IVA = Number(process.env.NEXT_PUBLIC_PORCENTAJEIVA || 0.16);

export const ObtenerSesionUsuario = () => {
  let idUsuario = ""
  let nombreUsuario = ""
  let permisos: Modulo[] = []

  if (typeof window != 'undefined') {
    idUsuario = localStorage.getItem('idUsuario') || '';
    nombreUsuario = localStorage.getItem('NombreUsuario') || '';
    permisos = JSON.parse(localStorage.getItem('Permisos') || '[]') as Modulo[]
  }

  return { idUsuario, nombreUsuario, permisos };
};

export const ValidarPermisoModulo = (permiso: string) => {
  if (typeof window === "undefined") return null;

  let permisos = JSON.parse(localStorage.getItem('Permisos') || '[]') as Modulo[]

  return permisos.find((modulo) => modulo._id === permiso) || null;
}
export const ValidarPermisoModuloPadre = (permiso: string) => {
  if (typeof window === "undefined") return null;
  console.log(permiso)

  let permisos = JSON.parse(localStorage.getItem('Permisos') || '[]') as Modulo[]
  console.log(permisos)
  let modulo = permisos.find((modulo) => modulo.idPadre === permiso)
  console.log(modulo)
  return modulo || null;
}
export const convertirPesos = (numero: number) => {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(numero)
  }

