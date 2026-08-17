export interface CreatePlantillaHorarioRequest {
  especialistaId: number;
  diaSemana: number; // 0-6
  horaInicio: string;
  horaFin: string;
}

export interface CreateHorarioCentroRequest {
  diaSemana: number; // 0-6
  horaInicio: string;
  horaFin: string;
}
