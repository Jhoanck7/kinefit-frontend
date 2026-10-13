const DURACION_BLOQUE_MIN = 30;

// La franja 14:00-15:00 no existe: el generador simplemente no la produce
const TRAMOS_SEMANA: { inicio: string; termino: string }[] = [
  { inicio: "09:00", termino: "14:00" },
  { inicio: "15:00", termino: "21:00" },
];

const TRAMOS_FIN_DE_SEMANA: { inicio: string; termino: string }[] = [
  { inicio: "10:00", termino: "14:00" },
  { inicio: "15:00", termino: "21:00" },
];

/** Indica si el día de la semana dado (0 = domingo) es sábado o domingo */
export function esFinDeSemana(diaSemana: number): boolean {
  return diaSemana === 0 || diaSemana === 6;
}

/** Obtiene los tramos de atención del centro para un día de la semana dado */
export function tramosDelDia(
  diaSemana: number
): { inicio: string; termino: string }[] {
  return esFinDeSemana(diaSemana) ? TRAMOS_FIN_DE_SEMANA : TRAMOS_SEMANA;
}

function minutosDesdeMedianoche(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function horaDesdeMinutos(minutos: number): string {
  const h = Math.floor(minutos / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutos % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

// Genera los bloques de 30 minutos de un tramo sin incluir el minuto de término como inicio de un bloque nuevo
function bloquesDeTramo(rango: {
  inicio: string;
  termino: string;
}): { inicio: string; termino: string }[] {
  const inicio = minutosDesdeMedianoche(rango.inicio);
  const fin = minutosDesdeMedianoche(rango.termino);
  const bloques: { inicio: string; termino: string }[] = [];
  for (
    let t = inicio;
    t + DURACION_BLOQUE_MIN <= fin;
    t += DURACION_BLOQUE_MIN
  ) {
    bloques.push({
      inicio: horaDesdeMinutos(t),
      termino: horaDesdeMinutos(t + DURACION_BLOQUE_MIN),
    });
  }
  return bloques;
}

/** Genera la rejilla completa de bloques de atención del centro para un día de la semana dado */
export function generarRejillaDia(
  diaSemana: number
): { inicio: string; termino: string }[] {
  return tramosDelDia(diaSemana).flatMap(bloquesDeTramo);
}

/** Obtiene la primera hora de atención de un día de la semana dado */
export function primeraHoraDelDia(diaSemana: number): string {
  return tramosDelDia(diaSemana)[0].inicio;
}

/** Obtiene la última hora de término de atención de un día de la semana dado */
export function ultimaHoraDelDia(diaSemana: number): string {
  const tramos = tramosDelDia(diaSemana);
  return tramos[tramos.length - 1].termino;
}

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
