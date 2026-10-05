/** Datos para bloquear un tramo de agenda de un especialista puntual */
export interface CreateBloqueoAgendaRequest {
  especialistaId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  mostrarEnSitio?: boolean;
  motivoPublico?: string;
}

/** Datos para bloquear un tramo de agenda para todos los especialistas */
export interface CreateBloqueoAgendaTodosRequest {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  mostrarEnSitio?: boolean;
  motivoPublico?: string;
}
