import { BLOQUEOS } from "./_seed/bloqueos";
import { getEspecialista } from "./especialistas";
import { fechaDesdeOffset } from "./resolver";
import { BloqueoResuelto } from "./citas";

export async function listBloqueosEspecialista(
  especialistaId: string,
  hoy: Date
): Promise<BloqueoResuelto[]> {
  const especialista = await getEspecialista(especialistaId);
  if (!especialista) return [];
  return BLOQUEOS.filter((b) => b.especialistaId === especialistaId).map((b) => ({
    id: b.id,
    horaInicio: b.horaInicio,
    horaTermino: b.horaTermino,
    motivo: b.motivo,
    fecha: fechaDesdeOffset(hoy, b.offsetDias),
    especialista,
  }));
}
