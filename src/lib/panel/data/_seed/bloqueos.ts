import { Bloqueo } from "../../domain/tipos";

/**
 * Bloqueo personal de ejemplo, en una franja distinta de 14:00–15:00: esa
 * franja es el cierre del centro y no se representa nunca como bloqueo
 * (A-2, G-5, RF-GEN-011).
 */
export const BLOQUEOS: Bloqueo[] = [
  {
    id: "bloqueo-0001",
    especialistaId: "esp-franchesca",
    offsetDias: 0,
    horaInicio: "19:00",
    horaTermino: "19:30",
    motivo: "Reunión clínica de equipo",
  },
];
