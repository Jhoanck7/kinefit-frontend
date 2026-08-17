import { create } from "zustand";

import { Servicio } from "@/lib/tipos";

/** Estado del asistente de nueva reserva: en memoria, sin persistencia. */
interface NuevaReservaState {
  fecha: Date | null;
  hora: string | null;
  bloqueHorarioIds: number[];
  pacienteId: string | null;
  pacienteNombre: string | null;
  especialistaId: string | null;
  especialistaNombre: string | null;
  servicio: Servicio | null;
  notaPaciente: string;
  notaInterna: string;
  setHorario: (
    fecha: Date,
    hora: string,
    bloqueHorarioIds?: number[]
  ) => void;
  setPaciente: (id: string, nombre: string) => void;
  setEspecialista: (id: string, nombre: string) => void;
  setServicio: (servicio: Servicio) => void;
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
  servicio: null,
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
  setServicio: servicio => set({ servicio }),
  setNotaPaciente: notaPaciente => set({ notaPaciente }),
  setNotaInterna: notaInterna => set({ notaInterna }),
  reiniciar: () => set(ESTADO_INICIAL),
}));
