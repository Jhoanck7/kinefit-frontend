const DURACION_BLOQUE_MIN = 30;

/** Suma minutos a una hora "HH:mm" y devuelve la nueva hora en el mismo formato */
export function sumarMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(":").map(Number);
  const total = h * 60 + m + minutos;
  const hFin = Math.floor(total / 60);
  const mFin = total % 60;
  return `${hFin.toString().padStart(2, "0")}:${mFin.toString().padStart(2, "0")}`;
}

/** Indica si una lista de horas ordenadas forma bloques consecutivos sin huecos */
export function sonConsecutivas(
  horasOrdenadas: string[],
  duracionBloqueMin = DURACION_BLOQUE_MIN
): boolean {
  for (let i = 1; i < horasOrdenadas.length; i++) {
    if (
      sumarMinutos(horasOrdenadas[i - 1], duracionBloqueMin) !==
      horasOrdenadas[i]
    ) {
      return false;
    }
  }
  return true;
}

/** Calcula cuántos bloques de horario se necesitan para cubrir una duración en minutos */
export function bloquesRequeridos(
  duracionMinutos: number | undefined,
  duracionBloqueMin = DURACION_BLOQUE_MIN
): number {
  if (!duracionMinutos || duracionMinutos <= 0) return 0;
  return Math.ceil(duracionMinutos / duracionBloqueMin);
}
