/** Datos para crear una cita desde el panel administrativo */
export interface CreateCitaManualRequest {
  pacienteId: number;
  especialistaId: number;
  servicioId: number;
  bloqueHorarioIds: number[];
  empresaId?: number;
  notaPaciente?: string;
  notaInterna?: string;
}

/** Datos para crear una cita desde el sitio público de reservas */
export interface CreateCitaPublicaRequest {
  especialistaId: number;
  servicioId: number;
  bloqueHorarioId: number;
  duracionMinutos: number;
  empresaId?: number | null;
  notaPaciente?: string | null;
}

/** Datos para cambiar el estado de una cita */
export interface UpdateCitaEstadoRequest {
  estadoNuevo: string;
  motivo?: string;
  confirmadoPor?: string;
}
