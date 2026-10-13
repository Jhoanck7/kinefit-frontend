/** Datos para crear un bloque de la plantilla horaria semanal de un especialista */
export interface CreatePlantillaHorarioRequest {
  especialistaId: number;
  diaSemana: number; // domingo=0 a sábado=6
  horaInicio: string;
  horaFin: string;
}

/** Datos para crear un bloque del horario general del centro */
export interface CreateHorarioCentroRequest {
  diaSemana: number; // domingo=0 a sábado=6
  horaInicio: string;
  horaFin: string;
}
