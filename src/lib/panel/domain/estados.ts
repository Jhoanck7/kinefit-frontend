import { CodigoEstadoCita, Origen } from "./tipos";

export type ColorRolEstado =
  | "azul-seleccion"
  | "ambar"
  | "verde"
  | "azul-profundo"
  | "rojo"
  | "gris";

export type IdAccionCita =
  | "confirmar"
  | "cancelar"
  | "marcar_asistida"
  | "marcar_no_asistida";

export interface AccionCita {
  id: IdAccionCita;
  etiqueta: string;
  estilo: "primario" | "secundario" | "peligro";
}

export interface DefinicionEstadoCita {
  codigo: CodigoEstadoCita;
  etiqueta: string;
  colorRol: ColorRolEstado;
  conTrama?: boolean;
  origenes: Origen[];
  soloLectura: boolean;
  expiraSola: boolean;
  acciones: AccionCita[];
  explicacionSinAcciones?: string;
}

/**
 * Catálogo único de los 7 estados de cita (DD-5). Todo componente que
 * muestre un estado, sus colores o sus acciones lee de aquí — nunca
 * decide su propio color, etiqueta o botones.
 */
export const CATALOGO_ESTADOS: Record<CodigoEstadoCita, DefinicionEstadoCita> = {
  pendiente_pago: {
    codigo: "pendiente_pago",
    etiqueta: "Pendiente de pago",
    colorRol: "azul-seleccion",
    origenes: ["web"],
    soloLectura: false,
    expiraSola: true,
    acciones: [],
    explicacionSinAcciones:
      "Esta cita tiene una transacción de Webpay en curso. No es modificable manualmente: se confirma sola al completarse el pago, o expira automáticamente si la sesión de pago vence.",
  },
  por_confirmar: {
    codigo: "por_confirmar",
    etiqueta: "Por confirmar",
    colorRol: "ambar",
    origenes: ["manual"],
    soloLectura: false,
    expiraSola: false,
    acciones: [
      { id: "confirmar", etiqueta: "Confirmar cita", estilo: "primario" },
      { id: "cancelar", etiqueta: "Cancelar cita", estilo: "peligro" },
    ],
  },
  confirmada: {
    codigo: "confirmada",
    etiqueta: "Confirmada",
    colorRol: "verde",
    origenes: ["web", "manual"],
    soloLectura: false,
    expiraSola: false,
    acciones: [
      { id: "marcar_no_asistida", etiqueta: "Marcar no asistida", estilo: "secundario" },
      { id: "marcar_asistida", etiqueta: "Marcar como asistida", estilo: "primario" },
      { id: "cancelar", etiqueta: "Cancelar cita", estilo: "peligro" },
    ],
  },
  atendida: {
    codigo: "atendida",
    etiqueta: "Atendida",
    colorRol: "azul-profundo",
    origenes: ["web", "manual"],
    soloLectura: true,
    expiraSola: false,
    acciones: [],
  },
  no_asistida: {
    codigo: "no_asistida",
    etiqueta: "No asistida",
    colorRol: "rojo",
    origenes: ["web", "manual"],
    soloLectura: true,
    expiraSola: false,
    acciones: [],
  },
  cancelada: {
    codigo: "cancelada",
    etiqueta: "Cancelada",
    colorRol: "gris",
    origenes: ["web", "manual"],
    soloLectura: true,
    expiraSola: false,
    acciones: [],
  },
  expirada: {
    codigo: "expirada",
    etiqueta: "Expirada",
    colorRol: "gris",
    conTrama: true,
    origenes: ["web"],
    soloLectura: true,
    expiraSola: true,
    acciones: [],
  },
};

export const ORDEN_ESTADOS: CodigoEstadoCita[] = [
  "pendiente_pago",
  "por_confirmar",
  "confirmada",
  "atendida",
  "no_asistida",
  "cancelada",
  "expirada",
];

export function definicionEstado(codigo: CodigoEstadoCita): DefinicionEstadoCita {
  return CATALOGO_ESTADOS[codigo];
}
