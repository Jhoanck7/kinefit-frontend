import { getEspecialista } from "./especialistas";
import { BloqueoResuelto } from "./citas";
import { agendaService } from "@/lib/services/agenda.service";

export interface CrearBloqueoInput {
  especialistaId: string;
  fecha: Date;
  horaInicio: string;
  horaTermino: string;
  motivo: string;
}

export async function crearBloqueo(input: CrearBloqueoInput): Promise<BloqueoResuelto> {
  const espId = parseInt(input.especialistaId.replace(/\D/g, ""), 10) || 1;
  const fechaIso = input.fecha.toISOString().split("T")[0];
  const res = await agendaService.createBloqueo({
    especialistaId: espId,
    fechaInicio: fechaIso,
    fechaFin: fechaIso,
    horaInicio: input.horaInicio,
    horaFin: input.horaTermino,
    motivo: input.motivo,
  });
  const especialista = await getEspecialista(input.especialistaId);
  return {
    id: String(res.id),
    horaInicio: res.horaInicio,
    horaTermino: res.horaFin,
    motivo: res.motivo,
    fecha: new Date(res.fechaInicio),
    especialista: especialista || { id: input.especialistaId, nombre: res.especialistaNombre || "Especialista", cargo: "Profesional", servicios: ["kinesiologia"] },
    activo: !res.revertido,
  };
}

export async function revertirBloqueo(id: string): Promise<boolean> {
  const numId = parseInt(id.replace(/\D/g, ""), 10);
  if (!isNaN(numId)) {
    const res = await agendaService.revertirBloqueo(numId);
    return !res.revertido;
  }
  return false;
}

export async function listBloqueosEspecialista(
  especialistaId: string,
  _hoy?: Date
): Promise<BloqueoResuelto[]> {
  try {
    const espId = parseInt(especialistaId.replace(/\D/g, ""), 10);
    if (!isNaN(espId)) {
      const res = await agendaService.getBloqueos(espId);
      if (res && Array.isArray(res)) {
        const especialista = await getEspecialista(especialistaId);
        return res.map((b) => ({
          id: String(b.id),
          horaInicio: b.horaInicio,
          horaTermino: b.horaFin,
          motivo: b.motivo,
          fecha: new Date(b.fechaInicio),
          especialista: especialista || { id: especialistaId, nombre: b.especialistaNombre || "Especialista", cargo: "Profesional", servicios: ["kinesiologia"] },
          activo: !b.revertido,
        }));
      }
    }
  } catch {
    // Error backend
  }

  return [];
}
