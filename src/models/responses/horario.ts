export interface PlantillaHorarioResponse {
  id: number;
  especialistaId: number;
  diaSemana: number; // 0=Domingo .. 6=Sábado
  horaInicio: string;
  horaFin: string;
}

export interface ConflictoGeneracionResponse {
  bloqueId: number;
  especialistaId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
}

export interface PlantillaHorarioResultadoResponse {
  plantilla: PlantillaHorarioResponse | null;
  conflictos: ConflictoGeneracionResponse[];
}

export interface HorarioCentroResponse {
  id: number;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
}
