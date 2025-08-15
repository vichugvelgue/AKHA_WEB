export interface Actividad {
  _id: string;
  nombre: string;
  descripcion: string;
  frecuencia: 'Diaria' | 'Semanal' | 'Mensual' | 'Trimestral';
}

// Nueva interfaz para el estado del formulario
export interface ActividadFormState extends Omit<Actividad, '_id'> {
  _id: string | null;
}
export interface TipoUsuario {
  _id?: string | null;
  Nombre: string;
  Estado?: number;
  Permisos?: Permiso[];
}
export interface Modulo {
  idPadre?: string;
  _id?: string;
  Nombre?: string;
  Estado?: number;
  FechaCreacion?: Date;
  seleccionado?: boolean;
}
export interface Permiso {
  _id?: string;
  idTipoUsuario?: string | null;
  idModulo: string;
}