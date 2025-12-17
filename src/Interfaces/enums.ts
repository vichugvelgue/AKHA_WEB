
export enum PermisoPadre {
    Administracion = "689e0ae4f51a6574612d500a",
    Contador = "689e0b62f51a6574612d5026",
    Clientes = "Clientes",
    Cobranza = "Cobranza",
    Proyectos = "Proyectos",
    Supervision = "Supervision",
}
export enum EstatusValidacion {
    Pendiente = "Pendiente",
    Autorizado = "Autorizado",
    Rechazado = "Rechazado",
}
export enum Frecuencia {
    Mensual = "Mensual",
    Bimestral = "Bimestral",
    Anual = "Anual",
}
export enum InicioSemana {
    Semana_1 = 7,
    Semana_2 = 8,
    Semana_3 = 15,
    Semana_4 = 23,
}
export enum EstatusActividad {
    Pendiente,
    En_proceso,
    Detenido,
    Terminado,
    Con_incidencia,
}
export enum MetodoPago {
    Efectivo = "Efectivo",
    Tarjeta_credito = "Tarjeta_de_credito",
    Tarjeta_debito = "Tarjeta_debito",
    Transferencia = "Transferencia",
    Deposito = "Depósito",
    Cheque = "Cheque",
}
export enum TipoRegistroPago {
    Acuse = "Acuse",
    Recibo = "Formato_de_pago",
}
