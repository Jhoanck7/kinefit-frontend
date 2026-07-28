import { create } from "zustand";
import { Servicio } from "@/lib/panel/domain/tipos";

/** Estado del asistente de nueva reserva (DD-4): en memoria, sin persistencia. */
interface NuevaReservaState {
  fecha: Date | null;
  hora: string | null;
  pacienteId: string | null;
  pacienteNombre: string | null;
  servicio: Servicio | null;
  notaPaciente: string;
  notaInterna: string;
  setHorario: (fecha: Date, hora: string) => void;
  setPaciente: (id: string, nombre: string) => void;
  setServicio: (servicio: Servicio) => void;
  setNotaPaciente: (valor: string) => void;
  setNotaInterna: (valor: string) => void;
  reiniciar: () => void;
}

const ESTADO_INICIAL = {
  fecha: null,
  hora: null,
  pacienteId: null,
  pacienteNombre: null,
  servicio: null,
  notaPaciente: "",
  notaInterna: "",
};

export const useNuevaReservaStore = create<NuevaReservaState>()((set) => ({
  ...ESTADO_INICIAL,
  setHorario: (fecha, hora) => set({ fecha, hora }),
  setPaciente: (pacienteId, pacienteNombre) => set({ pacienteId, pacienteNombre }),
  setServicio: (servicio) => set({ servicio }),
  setNotaPaciente: (notaPaciente) => set({ notaPaciente }),
  setNotaInterna: (notaInterna) => set({ notaInterna }),
  reiniciar: () => set(ESTADO_INICIAL),
}));
