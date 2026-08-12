import { Especialista, PlantillaHorarioEspecialista } from "../../domain/tipos";

/**
 * DATOS DE PRUEBA — Hito 4 Catálogo de Servicios.
 */
export const ESPECIALISTAS: Especialista[] = [
  {
    id: "esp-franchesca",
    nombre: "Franchesca Astudillo",
    cargo: "Masoterapeuta",
    servicios: [
      "embarazadas",
      "masajes_pareja",
      "masajes",
      "masajes_premium",
      "masajes_reductivos",
      "voucher_regalo",
    ],
  },
  {
    id: "esp-valeria",
    nombre: "Valeria Araneda",
    cargo: "Kinesióloga",
    servicios: [
      "embarazadas",
      "masajes_pareja",
      "masajes",
      "masajes_premium",
      "masajes_reductivos",
      "voucher_regalo",
      "kinesiologia",
    ],
  },
  {
    id: "esp-constanza",
    nombre: "Constanza Maldonado",
    cargo: "Kinesióloga",
    servicios: [
      "embarazadas",
      "masajes_pareja",
      "masajes",
      "masajes_premium",
      "masajes_reductivos",
      "voucher_regalo",
      "kinesiologia",
    ],
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
