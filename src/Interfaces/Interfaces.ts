import { TipoEmpleado } from "../app/dashboard/administracion/usuarios/page";
import { EstatusValidacion, Frecuencia, MetodoPago } from "./enums";

export interface User {
  _id?: string;
  Nombres?: string;
  Apellidos?: string;
  NombreCompleto?: string;
  Correo?: string;
  idTipoUsuario?: TipoEmpleado;
}
export interface Actividad {
  _id: string;
  nombre: string;
  descripcion: string;
  FechaFin: number;
  frecuencia: Frecuencia;
  Orden?: number;
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
  Cumpleanos?: string;
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
  ActividadesSeleccionadas: string[];
  ServiciosContribuyente: ServicioSeleccionado[];
  idUsuarioCreacion?: string;
  idGrupoEmpresarial?: string;
  idContador?: string;
  // Nuevos objetos para los campos de contacto
  RepresentanteLegal: RepresentanteLegal;
  DuenoEmpresa: PersonaContacto;
  ContactoCobranza: PersonaContacto;
  GerenteOperativo: PersonaContacto;
  EnlaceAkha: PersonaContacto;
  Cumpleanos: string;
}

export type ServicioSeleccionado = {
  idServicio: string;
  ListaActividades: string[];
  Costo: number;
}

export interface ServicioItem {
  _id: string;
  Nombre: string;
  Estado: number;
  Actividades: Actividad[];
  ActividadesServicio: {
    idActividad: string;
    Orden?: number;
  }[];
};
export interface ContactoPrincipal {
  Nombre: string;
  Telefono: string;
  Correo: string;
}

export interface GrupoEmpresarial {
  _id?: string;
  Estado?: number;
  idUsuarioCreacion?: string | null;

  Nombre?: string;
  Responsable?: string
  idResponsable?: string | null;
  Contacto?: string

  Integrantes?: Cliente[];

  Observaciones?: string;
  FechaCreacion?: Date;
  ContactoPrincipal?: ContactoPrincipal;
  MotivoReasignacion?: string;
}
export interface ContribuyenteGrupo {
  _id?: string;
  Estado?: number;
  idUsuarioCreacion?: string;
  FechaCreacion: Date;

  TipoMovimiento: number;
  idGrupo?: string;
  idContribuyente?: string;
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
export interface Bitacora {
  _id?: string;
  Estado?: number;
  TipoMovimiento?: number;
  Descripcion?: string;
  InfoAnterior?: GrupoEmpresarial | Cliente;
  idGrupo?: string;
  idCliente?: string;
  idUsuarioAplico?: string;
  Fecha?: Date;
  Hora?: string;
}

export interface ClavesSAT {
  archivoCer: string;
  archivoKey?: string;
  contrasenaFirma: string;
  fechaCaducidad: Date;
  fechaCaducidadSello: Date;
}
export interface ClavesIDSE {
  rfc: string;
  archivoKey: string;
  archivoCer: string;
  contrasenaFiel: string;
  fechaCaducidad: Date;
}
export interface ClavesSIPARE {
  registroPatronal: string;
  contrasena: string;
  fechaCaducidad: Date;
}export interface ClavesISN {
  rfc: string;
  contrasena: string;
  fechaCaducidad: Date;
  codigoEstado: string;
}
export interface Credencial {
  _id?: string;
  Estado?: number;
  idCliente?: string;
  clavesSAT: ClavesSAT;
  clavesIDSE: ClavesIDSE;
  clavesSIPARE: ClavesSIPARE;
  clavesISN: ClavesISN;
}
export interface Impuesto {
  _id?: string;
  Estado?: number;
  Nombre: string;
  idCliente?: string;
}
export interface CalculoImpuesto {
  idImpuesto?: string | null;
  Monto?: number;
  Utilizado?: number;
  Nombre?: string;
  observaciones?: string;
}
export interface CalculoFiscal {
  _id?: string;
  Estado?: number;
  idCliente?: string;
  idCapturo?: string;
  Impuestos?: CalculoImpuesto[];
  FechaCalculo?: Date;
  Total?: number;
}
export interface ResumenEjecutivo {
  _id?: string;
  Estado?: number;
  idCliente?: string;
  idCapturo?: string;

  Ingresos?: string;
  Egresos?: string;
  Nominas?: string;
  ImpuestosFederales?: string;

  FechaResumen?: Date;
  FechaRegistro?: Date;
}
export interface ValidacionCalculoFiscal {
  _id?: string;
  Estado?: number;
  EstadoAceptacion?: EstatusValidacion;
  idCliente?: string;
  idCalculo?: string;
  idCapturo?: string;

  Evidencia?: string;
  MotivosRechazo?: string;

  Fecha?: Date;
  FechaRegistro?: Date;
}

export interface ConfigAutorizacionPagos {
  DiaLimiteConfirmacionCalculo: number;
}
export interface ConfigActividades {
  LimiteIncidencias: number;
  AnticipacionCreacion: number;
  DiasRecordatorio: number;
}
export interface Configuracion {
  _id?: string;
  AutorizacionPagos: ConfigAutorizacionPagos;
  Actividades: ConfigActividades;
  FechaActualizacion?: Date;
}

export interface HistorialSaldo {
  _id?: string;
  Estado?: number;
  idCliente?: string;
  idImpuesto?: string;
  idCalculo?: string;
  Monto?: number;
  Observaciones?: string;
  Fecha?: Date;
  FechaModificacion?: Date;
  FechaRegistro?: Date;
}
export interface TotalSaldoFavor {
  _id?: string;
  idCliente?: string;
  Acumulado?: number;
  Utilizado?: number;
  Disponible?: number;
}
export interface ActividadPeriodica {
  _id?: string;
  Estado?: number;
  EstadoActividad?: number;

  Nombre: string;
  SemanaOperativa: number;

  idCliente: string;
  idServicio?: string;
  idActividad?: string;
  idIncidencia?: string;

  TipoOrigen?: "Sistema" | "Manual";
  idUsuarioRegistro?: string;

  FechaInicio: Date;
  FechaVencimiento: Date;
}
export interface PagoPendiente {
  _id?: string;
  Estado?: number;
  idCliente?: string;
  idServicio?: string;
  Descripcion: string;
  Monto: number;
  Pendiente: number;
  FechaVencimiento?: Date;
  FechaRegistro?: Date;
  FechaActualizacion?: Date;
  Cliente: string
}
export interface PagoItem {
  idPago?: string;
  Descripcion?: string;
  Cantidad?: number;
  Pendiente?: number;
  IVA?: number;
  Subtotal?: number;
}
export interface Venta {
  _id?: string;
  Estado?: number;
  Folio?: string;

  idRazonSocial?: string;
  idCliente?: string;
  idUsuarioRegistro?: string;

  Pagos?: PagoItem[];

  Descripcion?: string;
  Total?: number;
  SubTotal?: number;
  IVA?: number;
  MetodoPago?: MetodoPago;
  Referencia?: string;

  NecesitaFactura?: boolean;
  idFactura?: string;
  FolioFacura?: string;

  FechaRegistro?: Date;
  FechaActualizacion?: Date;
}