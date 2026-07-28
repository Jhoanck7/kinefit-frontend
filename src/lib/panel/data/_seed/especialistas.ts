import { Especialista, PlantillaHorarioEspecialista } from "../../domain/tipos";

/**
 * DATOS DE PRUEBA — desechables. Ninguna vista importa de aquí directamente:
 * solo la capa de acceso (src/lib/panel/data/*.ts).
 */
export const ESPECIALISTAS: Especialista[] = [
  {
    id: "esp-franchesca",
    nombre: "Franchesca Astudillo",
    cargo: "Masoterapeuta",
    servicios: ["masoterapia"],
  },
  {
    id: "esp-valeria",
    nombre: "Valeria Araneda",
    cargo: "Kinesióloga",
    servicios: ["kinesiologia"],
  },
  {
    id: "esp-constanza",
    nombre: "Constanza Maldonado",
    cargo: "Kinesióloga",
    servicios: ["kinesiologia"],
  },
];

/** Horarios reales confirmados por el cliente (requerimientos 13.2 / RF-HOR-007). */
export const PLANTILLAS_HORARIO: PlantillaHorarioEspecialista[] = [
  {
    especialistaId: "esp-franchesca",
    dias: {
      0: [{ inicio: "10:00", termino: "14:00" }, { inicio: "15:00", termino: "21:00" }],
      1: [{ inicio: "09:00", termino: "14:00" }, { inicio: "15:00", termino: "21:00" }],
      2: [{ inicio: "09:00", termino: "14:00" }, { inicio: "15:00", termino: "21:00" }],
      3: [{ inicio: "09:00", termino: "14:00" }, { inicio: "15:00", termino: "21:00" }],
      4: [{ inicio: "09:00", termino: "14:00" }, { inicio: "15:00", termino: "21:00" }],
      5: [{ inicio: "09:00", termino: "14:00" }, { inicio: "15:00", termino: "21:00" }],
      6: [{ inicio: "10:00", termino: "14:00" }, { inicio: "15:00", termino: "21:00" }],
    },
  },
  {
    especialistaId: "esp-constanza",
    dias: {
      1: [{ inicio: "09:00", termino: "14:00" }, { inicio: "15:00", termino: "18:00" }],
      2: [{ inicio: "09:00", termino: "14:00" }, { inicio: "15:00", termino: "18:00" }],
      3: [{ inicio: "09:00", termino: "14:00" }, { inicio: "15:00", termino: "18:00" }],
      4: [{ inicio: "09:00", termino: "14:00" }, { inicio: "15:00", termino: "18:00" }],
      5: [{ inicio: "09:00", termino: "14:00" }, { inicio: "15:00", termino: "18:00" }],
    },
  },
  {
    especialistaId: "esp-valeria",
    dias: {
      1: [{ inicio: "18:00", termino: "21:00" }],
      2: [{ inicio: "18:00", termino: "21:00" }],
      3: [{ inicio: "18:00", termino: "21:00" }],
      4: [{ inicio: "18:00", termino: "21:00" }],
      5: [{ inicio: "18:00", termino: "21:00" }],
    },
  },
];
