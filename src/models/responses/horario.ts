export interface PlantillaHorarioResponse {
  id: number;
  especialistaId: number;
  diaSemana: number; // 0=Domingo .. 6=Sábado
  horaInicio: string;
  horaFin: string;
}

export interface HorarioCentroResponse {
  id: number;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
}
