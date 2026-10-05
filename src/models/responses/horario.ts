/** Un bloque de la plantilla horaria semanal de un especialista */
export interface PlantillaHorarioResponse {
  id: number;
  especialistaId: number;
  diaSemana: number; // 0=Domingo .. 6=Sábado
  horaInicio: string;
  horaFin: string;
}

/** Un conflicto detectado al generar bloques de agenda a partir de una plantilla horaria */
export interface ConflictoGeneracionResponse {
  bloqueId: number;
  especialistaId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
}

/** Resultado de guardar una plantilla horaria, con los conflictos que haya generado */
export interface PlantillaHorarioResultadoResponse {
  plantilla: PlantillaHorarioResponse | null;
  conflictos: ConflictoGeneracionResponse[];
}

/** Un bloque del horario general del centro */
export interface HorarioCentroResponse {
  id: number;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
}
