import { BLOQUEOS } from "./_seed/bloqueos";
import { getEspecialista } from "./especialistas";
import { fechaDesdeOffset } from "./resolver";
import { BloqueoResuelto } from "./citas";

export interface CrearBloqueoInput {
  especialistaId: string;
  fecha: Date;
  horaInicio: string;
  horaTermino: string;
  motivo: string;
}

const ESTADOS_BLOQUEOS = new Map<string, boolean>();
const BLOQUEOS_LOCALES: BloqueoResuelto[] = [];

export async function crearBloqueo(input: CrearBloqueoInput): Promise<BloqueoResuelto> {
  const especialista = await getEspecialista(input.especialistaId);
  if (!especialista) throw new Error("Especialista no encontrada");

  const id = `bloqueo-${Date.now()}`;
  const nuevoBloqueo: BloqueoResuelto = {
    id,
    horaInicio: input.horaInicio,
    horaTermino: input.horaTermino,
    motivo: input.motivo,
    fecha: input.fecha,
    especialista,
    activo: true,
  };

  ESTADOS_BLOQUEOS.set(id, true);
  BLOQUEOS_LOCALES.unshift(nuevoBloqueo);
  return nuevoBloqueo;
}

export async function revertirBloqueo(id: string): Promise<boolean> {
  const estadoActual = ESTADOS_BLOQUEOS.get(id) ?? true;
  const nuevoEstado = !estadoActual;
  ESTADOS_BLOQUEOS.set(id, nuevoEstado);

  const bLocal = BLOQUEOS_LOCALES.find((b) => b.id === id);
  if (bLocal) {
    bLocal.activo = nuevoEstado;
  }
  return nuevoEstado;
}

export async function listBloqueosEspecialista(
  especialistaId: string,
  hoy: Date
): Promise<BloqueoResuelto[]> {
  const especialista = await getEspecialista(especialistaId);
  if (!especialista) return [];

  const iniciales = BLOQUEOS.filter((b) => b.especialistaId === especialistaId).map((b) => ({
    id: b.id,
    horaInicio: b.horaInicio,
    horaTermino: b.horaTermino,
    motivo: b.motivo,
    fecha: fechaDesdeOffset(hoy, b.offsetDias),
    especialista,
    activo: ESTADOS_BLOQUEOS.get(b.id) ?? (b.activo !== false),
  }));

  const locales = BLOQUEOS_LOCALES.filter((b) => b.especialista.id === especialistaId).map((b) => ({
    ...b,
    activo: ESTADOS_BLOQUEOS.get(b.id) ?? (b.activo !== false),
  }));

  return [...locales, ...iniciales];
}
