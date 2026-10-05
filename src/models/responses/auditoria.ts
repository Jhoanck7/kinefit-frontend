/** Una línea del historial de cambios de estado de una cita */
export interface AuditoriaCitaResponse {
  id: number;
  citaId: number;
  estadoAnterior: string;
  estadoNuevo: string;
  tipoActor: string;
  usuarioId?: number;
  usuarioNombre?: string;
  confirmadoPor?: string;
  motivo?: string;
  createdAt: string;
}
