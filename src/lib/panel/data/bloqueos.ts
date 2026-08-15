import { agendaService } from "@/services";

import { BloqueoResuelto } from "./citas";
import { getEspecialista } from "./especialistas";

export interface CrearBloqueoInput {
  especialistaId: string;
  fecha: Date;
  horaInicio: string;
  horaTermino: string;
  motivo: string;
}

export async function crearBloqueo(
  input: CrearBloqueoInput
): Promise<BloqueoResuelto> {
  const espId = parseInt(input.especialistaId.replace(/\D/g, ""), 10) || 1;
  const fechaIso = input.fecha.toISOString().split("T")[0];
  const respuesta = await agendaService.createBloqueo({
    especialistaId: espId,
    fecha: fechaIso,
    horaInicio: input.horaInicio,
    horaFin: input.horaTermino,
    motivo: input.motivo,
  });
  const res = respuesta.data.data;
  const especialista = await getEspecialista(input.especialistaId);
  return {
    id: String(res.id),
    horaInicio: res.horaInicio,
    horaTermino: res.horaFin,
    motivo: res.motivo,
    fecha: new Date(res.fecha),
    especialista: especialista || {
      id: input.especialistaId,
      nombre: "Especialista",
      cargo: "Profesional",
      servicios: ["kinesiologia"],
    },
    activo: res.activo,
  };
}

export async function revertirBloqueo(id: string): Promise<boolean> {
  const numId = parseInt(id.replace(/\D/g, ""), 10);
  if (!isNaN(numId)) {
    const respuesta = await agendaService.revertirBloqueo(numId);
    return !respuesta.data.data.activo;
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
      const respuesta = await agendaService.getBloqueos(espId);
      const res = respuesta.data.data;
      const especialista = await getEspecialista(especialistaId);
      return res.map(b => ({
        id: String(b.id),
        horaInicio: b.horaInicio,
        horaTermino: b.horaFin,
        motivo: b.motivo,
        fecha: new Date(b.fecha),
        especialista: especialista || {
          id: especialistaId,
          nombre: "Especialista",
          cargo: "Profesional",
          servicios: ["kinesiologia"],
        },
        activo: b.activo,
      }));
    }
  } catch {
    // Error backend
  }

  return [];
}
