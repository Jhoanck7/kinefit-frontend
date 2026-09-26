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
