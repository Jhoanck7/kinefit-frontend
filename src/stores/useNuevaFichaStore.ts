import { create } from "zustand";

/**
 * Estado del asistente de nueva ficha (DD-4): vive en memoria, sin
 * persistencia. Una recarga a mitad de camino vuelve al paso 1.
 */
interface NuevaFichaState {
  pacienteId: string | null;
  pacienteNombre: string | null;
  citaId: string | null;
  formatoId: string | null;
  contenido: Record<string, string>;
  adjuntos: string[];
  setReserva: (
    pacienteId: string,
    pacienteNombre: string,
    citaId: string
  ) => void;
  setFormato: (formatoId: string) => void;
  setCampo: (campoId: string, valor: string) => void;
  agregarAdjunto: (nombre: string) => void;
  quitarAdjunto: (nombre: string) => void;
  reiniciar: () => void;
}

export const useNuevaFichaStore = create<NuevaFichaState>()(set => ({
  pacienteId: null,
  pacienteNombre: null,
  citaId: null,
  formatoId: null,
  contenido: {},
  adjuntos: [],
  setReserva: (pacienteId, pacienteNombre, citaId) =>
    set({ pacienteId, pacienteNombre, citaId }),
  setFormato: formatoId => set({ formatoId }),
  setCampo: (campoId, valor) =>
    set(estado => ({ contenido: { ...estado.contenido, [campoId]: valor } })),
  agregarAdjunto: nombre =>
    set(estado => ({ adjuntos: [...estado.adjuntos, nombre] })),
  quitarAdjunto: nombre =>
    set(estado => ({ adjuntos: estado.adjuntos.filter(a => a !== nombre) })),
  reiniciar: () =>
    set({
      pacienteId: null,
      pacienteNombre: null,
      citaId: null,
      formatoId: null,
      contenido: {},
      adjuntos: [],
    }),
}));
