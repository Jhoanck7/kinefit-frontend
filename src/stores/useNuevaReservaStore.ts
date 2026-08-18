import { create } from "zustand";

/** Estado del asistente de nueva reserva: en memoria, sin persistencia. */
interface NuevaReservaState {
  fecha: Date | null;
  /** Horas de inicio seleccionadas en la grilla (1 a 3), formato "HH:mm". */
  horasSeleccionadas: string[];
  /** Primera hora seleccionada, para mostrar en los paneles de resumen. */
  hora: string | null;
  /** Se resuelven recién al elegir especialista (GET /bloques). */
  bloqueHorarioIds: number[];
  pacienteId: number | null;
  pacienteNombre: string | null;
  especialistaId: number | null;
  especialistaNombre: string | null;
  servicioId: number | null;
  servicioNombre: string | null;
  notaPaciente: string;
  notaInterna: string;
  setHorario: (fecha: Date, horasSeleccionadas: string[]) => void;
  setPaciente: (id: number | null, nombre: string) => void;
  setEspecialista: (
    id: number,
    nombre: string,
    bloqueHorarioIds: number[]
  ) => void;
  setServicio: (id: number, nombre: string) => void;
  setNotaPaciente: (valor: string) => void;
  setNotaInterna: (valor: string) => void;
  reiniciar: () => void;
}

const ESTADO_INICIAL = {
  fecha: null,
  horasSeleccionadas: [] as string[],
  hora: null,
  bloqueHorarioIds: [] as number[],
  pacienteId: null,
  pacienteNombre: null,
  especialistaId: null,
  especialistaNombre: null,
  servicioId: null,
  servicioNombre: null,
  notaPaciente: "",
  notaInterna: "",
};

export const useNuevaReservaStore = create<NuevaReservaState>()(set => ({
  ...ESTADO_INICIAL,
  setHorario: (fecha, horasSeleccionadas) =>
    set({
      fecha,
      horasSeleccionadas,
      hora: [...horasSeleccionadas].sort()[0] ?? null,
      // Cambiar de horario invalida al especialista y los bloques ya resueltos.
      especialistaId: null,
      especialistaNombre: null,
      bloqueHorarioIds: [],
    }),
  setPaciente: (pacienteId, pacienteNombre) =>
    set({ pacienteId, pacienteNombre }),
  setEspecialista: (especialistaId, especialistaNombre, bloqueHorarioIds) =>
    set({ especialistaId, especialistaNombre, bloqueHorarioIds }),
  setServicio: (servicioId, servicioNombre) =>
    set({ servicioId, servicioNombre }),
  setNotaPaciente: notaPaciente => set({ notaPaciente }),
  setNotaInterna: notaInterna => set({ notaInterna }),
  reiniciar: () => set(ESTADO_INICIAL),
}));
