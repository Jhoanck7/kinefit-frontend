export interface CreateCitaManualRequest {
  pacienteId: number;
  especialistaId: number;
  servicioId: number;
  bloqueHorarioIds: number[];
  empresaId?: number;
  notaPaciente?: string;
  notaInterna?: string;
}

export interface CreateCitaPublicaRequest {
  especialistaId: number;
  servicioId: number;
  bloqueHorarioId: number;
  duracionMinutos: number;
  empresaId?: number | null;
  notaPaciente?: string | null;
}

export interface UpdateCitaEstadoRequest {
  estadoNuevo: string;
  motivo?: string;
  confirmadoPor?: string;
}
