import { Especialista, PlantillaHorarioEspecialista } from "../domain/tipos";
import { ESPECIALISTAS, PLANTILLAS_HORARIO } from "./_seed/especialistas";

export interface HorarioEspecialista {
  especialista: Especialista;
  plantilla: PlantillaHorarioEspecialista;
}

export async function listHorarios(): Promise<HorarioEspecialista[]> {
  return ESPECIALISTAS.map((especialista) => ({
    especialista,
    plantilla:
      PLANTILLAS_HORARIO.find((p) => p.especialistaId === especialista.id) ?? {
        especialistaId: especialista.id,
        dias: {},
      },
  }));
}

export async function getPlantillaEspecialista(
  especialistaId: string
): Promise<PlantillaHorarioEspecialista | undefined> {
  return PLANTILLAS_HORARIO.find((p) => p.especialistaId === especialistaId);
}
