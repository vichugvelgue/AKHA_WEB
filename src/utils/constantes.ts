export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export const ObtenerSesionUsuario = () => {
  if (typeof window === 'undefined') {
    return {
      idUsuario: '',
      nombreUsuario: '',
      permisos: ''
    };
  }
  
  return {
    idUsuario: localStorage.getItem('idUsuario') || '',
    nombreUsuario: localStorage.getItem('NombreUsuario') || '',
    permisos: JSON.parse(localStorage.getItem('Permisos') || '[]')
  };
};
