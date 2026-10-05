/** Datos del paciente tal como se muestran en el contexto de una cita */
export interface PacienteCitaResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rut?: string;
}

/** Estados posibles del ciclo de vida de una cita */
export type CodigoEstadoCita =
  | "PendientePago"
  | "PorConfirmar"
  | "Confirmada"
  | "Atendida"
  | "NoAsistida"
  | "Cancelada"
  | "Expirada";

/** Resultado de crear una cita */
export interface CitaCreadaResponse {
  citaId: number;
  estado: string;
  especialista: string;
  servicio: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  paciente: PacienteCitaResponse;
  origen: string;
  createdAt: string;
}

/** Resumen de la transacción de pago asociada a una cita */
export interface CitaTransaccionResumenResponse {
  id: number;
  estado: string;
  buyOrder: string;
}

/** Una cita tal como aparece en un listado */
export interface CitaResumenResponse {
  id: number;
  estado: string;
  especialista: string;
  servicio: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  paciente: PacienteCitaResponse;
  transaccion?: CitaTransaccionResumenResponse;
  createdAt: string;
}

/** Página de citas listadas */
export interface CitasPaginadasResponse {
  total: number;
  page: number;
  pageSize: number;
  items: CitaResumenResponse[];
}

/** Datos del especialista tal como se muestran en el contexto de una cita */
export interface EspecialistaCitaResponse {
  id: number;
  nombre: string;
  cargo: string;
}

/** Datos del servicio tal como se muestran en el contexto de una cita */
export interface ServicioCitaResponse {
  id: number;
  nombre: string;
}

/** Bloque horario reservado por una cita */
export interface BloqueHorarioCitaResponse {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

/** Detalle de la transacción de pago asociada a una cita */
export interface TransaccionDetalleResponse {
  id: number;
  buyOrder: string;
  monto: number;
  estado: string;
  createdAt: string;
}

/** Detalle completo de una cita */
export interface CitaDetalleResponse {
  id: number;
  estado: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  paciente: PacienteCitaResponse;
  especialista: EspecialistaCitaResponse;
  servicio: ServicioCitaResponse;
  bloqueHorario: BloqueHorarioCitaResponse;
  transaccion?: TransaccionDetalleResponse;
  origen: string;
  creadoPorUsuarioId?: number;
  motivoCancelacion?: string;
  confirmadoPor?: string;
  createdAt: string;
}

/** Resultado de cambiar el estado de una cita */
export interface CitaEstadoActualizadoResponse {
  id: number;
  estadoAnterior: string;
  estadoNuevo: string;
  updatedAt: string;
  advertencia?: string;
}

/** Qué se pierde o afecta si se cancela una cita, para mostrar antes de confirmar */
export interface ImpactoCancelacionResponse {
  tienePagoAsociado: boolean;
  montoPagado: number;
  estadoTransaccion?: string;
  requiereMotivo: boolean;
  tieneFichaAsociada: boolean;
}
