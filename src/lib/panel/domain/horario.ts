import { DiaSemanaId, RangoHorario } from "./tipos";

const DURACION_BLOQUE_MIN = 30;

/**
 * Tramos de atención del centro. La franja 14:00–15:00 no existe: el
 * generador simplemente no la produce (RF-GEN-011, G-5, A-1/A-2).
 */
const TRAMOS_SEMANA: RangoHorario[] = [
  { inicio: "09:00", termino: "14:00" },
  { inicio: "15:00", termino: "21:00" },
];

const TRAMOS_FIN_DE_SEMANA: RangoHorario[] = [
  { inicio: "10:00", termino: "14:00" },
  { inicio: "15:00", termino: "21:00" },
];

export function esFinDeSemana(diaSemana: DiaSemanaId): boolean {
  return diaSemana === 0 || diaSemana === 6;
}

export function tramosDelDia(diaSemana: DiaSemanaId): RangoHorario[] {
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

/**
 * Genera los bloques de 30 minutos de un tramo, sin incluir el minuto de término
 * como inicio de un bloque nuevo.
 */
function bloquesDeTramo(rango: RangoHorario): RangoHorario[] {
  const inicio = minutosDesdeMedianoche(rango.inicio);
  const fin = minutosDesdeMedianoche(rango.termino);
  const bloques: RangoHorario[] = [];
  for (let t = inicio; t + DURACION_BLOQUE_MIN <= fin; t += DURACION_BLOQUE_MIN) {
    bloques.push({
      inicio: horaDesdeMinutos(t),
      termino: horaDesdeMinutos(t + DURACION_BLOQUE_MIN),
    });
  }
  return bloques;
}

/**
 * Rejilla completa del centro para un día de la semana dado (0 = domingo).
 * Nunca produce un bloque entre 14:00 y 15:00.
 */
export function generarRejillaDia(diaSemana: DiaSemanaId): RangoHorario[] {
  return tramosDelDia(diaSemana).flatMap(bloquesDeTramo);
}

/**
 * Intersecta la rejilla del centro con la plantilla horaria de un especialista,
 * dejando solo los bloques en que efectivamente atiende.
 */
export function generarRejillaEspecialista(
  diaSemana: DiaSemanaId,
  rangosEspecialista: RangoHorario[]
): RangoHorario[] {
  const rejillaCentro = generarRejillaDia(diaSemana);
  return rejillaCentro.filter((bloque) =>
    rangosEspecialista.some(
      (rango) =>
        minutosDesdeMedianoche(bloque.inicio) >= minutosDesdeMedianoche(rango.inicio) &&
        minutosDesdeMedianoche(bloque.termino) <= minutosDesdeMedianoche(rango.termino)
    )
  );
}

export function primeraHoraDelDia(diaSemana: DiaSemanaId): string {
  return tramosDelDia(diaSemana)[0].inicio;
}

export function ultimaHoraDelDia(diaSemana: DiaSemanaId): string {
  const tramos = tramosDelDia(diaSemana);
  return tramos[tramos.length - 1].termino;
}
