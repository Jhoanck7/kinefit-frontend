export interface CreateCitaManualRequest {
  pacienteId: number;
  especialistaId: number;
  servicioId: number;
  bloqueHorarioIds: number[];
  empresaId?: number;
  notaPaciente?: string;
  notaInterna?: string;
}

export interface UpdateCitaEstadoRequest {
  estadoNuevo: string;
  motivo?: string;
  confirmadoPor?: string;
}
