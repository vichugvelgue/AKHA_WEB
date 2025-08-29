import { Modulo } from "../Interfaces/Interfaces";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export const ObtenerSesionUsuario = () => {
  if (typeof window === 'undefined') {
    return {
      idUsuario: '',
      nombreUsuario: '',
      permisos: []
    };
  }
  
  const idUsuario = localStorage.getItem('idUsuario') || '';
  const nombreUsuario = localStorage.getItem('NombreUsuario') || '';
  const permisos = JSON.parse(localStorage.getItem('Permisos') || '[]') as Modulo[]
  
  return { idUsuario, nombreUsuario, permisos };
};

export const ValidarPermisoModulo = (permiso: string) => {
  if (typeof window === "undefined") return null;

  let permisos = JSON.parse(localStorage.getItem('Permisos') || '[]') as Modulo[]

  return permisos.find((modulo) => modulo._id === permiso) || null;
}
export const ValidarPermisoSeccion = (permiso: string) => {
  if (typeof window === "undefined") return null;

  let permisos = JSON.parse(localStorage.getItem('Permisos') || '[]') as Modulo[]

  return permisos.find((modulo) => modulo.idPadre === permiso) || null;
}
