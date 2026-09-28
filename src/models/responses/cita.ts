export interface PacienteCitaResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rut?: string;
}

export type CodigoEstadoCita =
  | "PendientePago"
  | "PorConfirmar"
  | "Confirmada"
  | "Atendida"
  | "NoAsistida"
  | "Cancelada"
  | "Expirada";

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

export interface CitaTransaccionResumenResponse {
  id: number;
  estado: string;
  buyOrder: string;
}

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

export interface CitasPaginadasResponse {
  total: number;
  page: number;
  pageSize: number;
  items: CitaResumenResponse[];
}

export interface EspecialistaCitaResponse {
  id: number;
  nombre: string;
  cargo: string;
}

export interface ServicioCitaResponse {
  id: number;
  nombre: string;
}

export interface BloqueHorarioCitaResponse {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

export interface TransaccionDetalleResponse {
  id: number;
  buyOrder: string;
  monto: number;
  estado: string;
  createdAt: string;
}

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

export interface CitaEstadoActualizadoResponse {
  id: number;
  estadoAnterior: string;
  estadoNuevo: string;
  updatedAt: string;
  advertencia?: string;
}

export interface ImpactoCancelacionResponse {
  tienePagoAsociado: boolean;
  montoPagado: number;
  estadoTransaccion?: string;
  requiereMotivo: boolean;
  tieneFichaAsociada: boolean;
}
