/** Una franja horaria disponible para reservar */
export interface FranjaDisponibleResponse {
  id: number;
  horaInicio: string;
  horaFin: string;
  estado: string;
  motivo?: string;
}
