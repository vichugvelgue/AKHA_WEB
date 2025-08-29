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
export interface RegimenFiscal {
  _id?: string;
  Nombre?: string;
  Clave: number;
}
export interface PersonaContacto {
  Nombre: string;
  Telefono: string;
  Correo: string;
}

export interface RepresentanteLegal {
  Nombre: string;
  RFC: string;
  Alias: string;
  Cumpleanos: string;
}

// Interfaz Cliente actualizada para incluir todos los nuevos campos anidados
export interface Cliente {
  _id?: string;
  Estado?: number;
  RazonSocial?: string;
  RFC?: string;
  TipoPersona?: "Fisica" | "Moral" | ""; // Nuevo campo para tipo de persona
  RegimenFiscal?: number;
  CodigoPostal?: string;
  Direccion?: string;
  ClasificacionComercial?: string;
  OrigenContacto?: string;
  RecomendadoPor?: string;
  ValorGrupo?: string;
  CanalPreferente?: string;
  CorreoInstitucional?: string;
  CorreoElectronico?: string;
  NumeroTelefono?: string;
  WhatsApp?: string;
  Observaciones?: string;
  Servicios?: string[];
  ServiciosSeleccionados: string[];
  idUsuarioCreacion?: string;
  idGrupoEmpresarial?: string;
  idContador?: string;
  // Nuevos objetos para los campos de contacto
  RepresentanteLegal: RepresentanteLegal;
  DuenoEmpresa: PersonaContacto;
  ContactoCobranza: PersonaContacto;
  GerenteOperativo: PersonaContacto;
  EnlaceAkha: PersonaContacto;
}
export interface GrupoEmpresarial {
  _id?: string;
  Estado?: number;

  Nombre?: string;
  Responsable?: string
  idResponsable?: string|null;
  Contacto?: string

  Integrantes?: Cliente[];

  Observaciones?: string;
  FechaCreacion?: Date;
}
export interface RazonSocial {
  _id?: string;
  Estado?: number;

  RazonSocial: string;
  RFC: string;
  RegimenFiscal?: number
  CodigoPostal?: string;
  Direccion?: string;
  TipoPersona?: string;

  Observaciones?: string;

  FechaCreacion?: Date;
  FechaActualizacion?: Date;
  FechaEliminacion?: Date;
}