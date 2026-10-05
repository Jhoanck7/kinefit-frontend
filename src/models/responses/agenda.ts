/** Datos mínimos del paciente que se muestran en la vista de agenda */
export interface PacienteEnAgendaResponse {
  id: number;
  nombre: string;
  apellido: string;
}

/** Cita resumida tal como aparece en un bloque de la agenda */
export interface CitaEnAgendaResponse {
  id: number;
  grupoCitaId?: string;
  estado: string;
  origen: string;
  paciente?: PacienteEnAgendaResponse;
  servicio: string;
}

/** Un bloque horario de la agenda de un especialista */
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

/** Un tramo de agenda bloqueado */
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

/** Un especialista que quedó fuera de un bloqueo masivo, con el motivo */
export interface BloqueoOmitidoResponse {
  especialistaId: number;
  especialistaNombre: string;
  motivo: string;
}

/** Resultado de bloquear un tramo de agenda para todos los especialistas */
export interface BloqueoAgendaTodosResponse {
  creados: BloqueoAgendaResponse[];
  omitidos: BloqueoOmitidoResponse[];
}
