import { create } from "zustand";

import { Servicio } from "@/lib/panel/domain/tipos";

/** Estado del asistente de nueva reserva: en memoria, sin persistencia. */
interface NuevaReservaState {
  fecha: Date | null;
  hora: string | null;
  bloqueHorarioId: number | null;
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
    bloqueHorarioId?: number | null
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
  bloqueHorarioId: null,
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
  setHorario: (fecha, hora, bloqueHorarioId = null) =>
    set({ fecha, hora, bloqueHorarioId: bloqueHorarioId ?? null }),
  setPaciente: (pacienteId, pacienteNombre) =>
    set({ pacienteId, pacienteNombre }),
  setEspecialista: (especialistaId, especialistaNombre) =>
    set({ especialistaId, especialistaNombre }),
  setServicio: servicio => set({ servicio }),
  setNotaPaciente: notaPaciente => set({ notaPaciente }),
  setNotaInterna: notaInterna => set({ notaInterna }),
  reiniciar: () => set(ESTADO_INICIAL),
}));
