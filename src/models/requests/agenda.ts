export interface CreateBloqueoAgendaRequest {
  especialistaId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  mostrarEnSitio?: boolean;
  motivoPublico?: string;
}
