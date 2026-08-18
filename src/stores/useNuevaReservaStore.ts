import { create } from "zustand";

/** Estado del asistente de nueva reserva: en memoria, sin persistencia. */
interface NuevaReservaState {
  fecha: Date | null;
  hora: string | null;
  bloqueHorarioIds: number[];
  pacienteId: string | null;
  pacienteNombre: string | null;
  especialistaId: string | null;
  especialistaNombre: string | null;
  servicioId: number | null;
  servicioNombre: string | null;
  servicioDuracionMinutos: number | null;
  notaPaciente: string;
  notaInterna: string;
  setHorario: (fecha: Date, hora: string, bloqueHorarioIds?: number[]) => void;
  setPaciente: (id: string, nombre: string) => void;
  setEspecialista: (id: string, nombre: string) => void;
  setServicio: (id: number, nombre: string, duracionMinutos?: number) => void;
  setNotaPaciente: (valor: string) => void;
  setNotaInterna: (valor: string) => void;
  reiniciar: () => void;
}

const ESTADO_INICIAL = {
  fecha: null,
  hora: null,
  bloqueHorarioIds: [] as number[],
  pacienteId: null,
  pacienteNombre: null,
  especialistaId: null,
  especialistaNombre: null,
  servicioId: null,
  servicioNombre: null,
  servicioDuracionMinutos: null,
  notaPaciente: "",
  notaInterna: "",
};

export const useNuevaReservaStore = create<NuevaReservaState>()(set => ({
  ...ESTADO_INICIAL,
  setHorario: (fecha, hora, bloqueHorarioIds = []) =>
    set({ fecha, hora, bloqueHorarioIds }),
  setPaciente: (pacienteId, pacienteNombre) =>
    set({ pacienteId, pacienteNombre }),
  setEspecialista: (especialistaId, especialistaNombre) =>
    set({ especialistaId, especialistaNombre }),
  setServicio: (servicioId, servicioNombre, servicioDuracionMinutos) =>
    set({
      servicioId,
      servicioNombre,
      servicioDuracionMinutos: servicioDuracionMinutos ?? null,
    }),
  setNotaPaciente: notaPaciente => set({ notaPaciente }),
  setNotaInterna: notaInterna => set({ notaInterna }),
  reiniciar: () => set(ESTADO_INICIAL),
}));
