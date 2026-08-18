export interface PacienteEnAgendaResponse {
  id: number;
  nombre: string;
  apellido: string;
}

export interface CitaEnAgendaResponse {
  id: number;
  estado: string;
  origen: string;
  paciente?: PacienteEnAgendaResponse;
  servicio: string;
}

export interface BloqueAgendaResponse {
  id: number;
  especialistaId: number;
  especialistaNombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: "Disponible" | "Ocupado" | "Bloqueado";
  cita?: CitaEnAgendaResponse;
}

export interface ConflictoGeneracionResponse {
  bloqueId: number;
  especialistaId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
}

export interface GeneracionAgendaResultadoResponse {
  bloquesCreados: number;
  bloquesYaExistentes: number;
  conflictos: ConflictoGeneracionResponse[];
}

export interface BloqueoAgendaResponse {
  id: number;
  especialistaId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  activo: boolean;
  mostrarEnSitio: boolean;
  motivoPublico?: string;
}
