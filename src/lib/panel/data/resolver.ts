import { sumarDias } from "../domain/formato";

/** Resuelve un offset de días de la semilla contra el "hoy" ya conocido por el llamador. */
export function fechaDesdeOffset(hoy: Date, offsetDias: number): Date {
  return sumarDias(hoy, offsetDias);
}

export function fechaHoraDesdeOffset(
  hoy: Date,
  offsetDias: number,
  hora: string
): Date {
  const fecha = fechaDesdeOffset(hoy, offsetDias);
  const [h, m] = hora.split(":").map(Number);
  fecha.setHours(h, m, 0, 0);
  return fecha;
}
