export interface AuditoriaCitaResponse {
  id: number;
  citaId: number;
  estadoAnterior: string;
  estadoNuevo: string;
  tipoActor: string;
  usuarioId?: number;
  motivo?: string;
  createdAt: string;
}
