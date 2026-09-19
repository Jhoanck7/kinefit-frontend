export interface PacienteEnAgendaResponse {
  id: number;
  nombre: string;
  apellido: string;
}

export interface CitaEnAgendaResponse {
  id: number;
  grupoCitaId?: string;
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
  estado: "Disponible" | "Reservado" | "Bloqueado";
  cita?: CitaEnAgendaResponse;
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

export interface BloqueoOmitidoResponse {
  especialistaId: number;
  especialistaNombre: string;
  motivo: string;
}

export interface BloqueoAgendaTodosResponse {
  creados: BloqueoAgendaResponse[];
  omitidos: BloqueoOmitidoResponse[];
}
