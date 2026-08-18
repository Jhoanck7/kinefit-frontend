import { CodigoEstadoCita } from "@/models/responses";

export type ColorRolEstado =
  "azul-seleccion" | "ambar" | "verde" | "azul-profundo" | "rojo" | "gris";

export type IdAccionCita =
  "confirmar" | "cancelar" | "marcar_asistida" | "marcar_no_asistida";

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
  origenes: ("web" | "manual")[];
  soloLectura: boolean;
  expiraSola: boolean;
  acciones: AccionCita[];
  explicacionSinAcciones?: string;
}

export const CATALOGO_ESTADOS: Record<CodigoEstadoCita, DefinicionEstadoCita> =
  {
    PendientePago: {
      codigo: "PendientePago",
      etiqueta: "Pendiente de pago",
      colorRol: "azul-seleccion",
      origenes: ["web"],
      soloLectura: false,
      expiraSola: true,
      acciones: [],
      explicacionSinAcciones:
        "Esta cita tiene una transacción de Webpay en curso. No es modificable manualmente: se confirma sola al completarse el pago, o expira automáticamente si la sesión de pago vence.",
    },
    PorConfirmar: {
      codigo: "PorConfirmar",
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
    Confirmada: {
      codigo: "Confirmada",
      etiqueta: "Confirmada",
      colorRol: "verde",
      origenes: ["web", "manual"],
      soloLectura: false,
      expiraSola: false,
      acciones: [
        {
          id: "marcar_no_asistida",
          etiqueta: "Marcar no asistida",
          estilo: "secundario",
        },
        {
          id: "marcar_asistida",
          etiqueta: "Marcar como asistida",
          estilo: "primario",
        },
        { id: "cancelar", etiqueta: "Cancelar cita", estilo: "peligro" },
      ],
    },
    Atendida: {
      codigo: "Atendida",
      etiqueta: "Atendida",
      colorRol: "azul-profundo",
      origenes: ["web", "manual"],
      soloLectura: true,
      expiraSola: false,
      acciones: [],
    },
    NoAsistida: {
      codigo: "NoAsistida",
      etiqueta: "No asistida",
      colorRol: "rojo",
      origenes: ["web", "manual"],
      soloLectura: true,
      expiraSola: false,
      acciones: [],
    },
    Cancelada: {
      codigo: "Cancelada",
      etiqueta: "Cancelada",
      colorRol: "gris",
      origenes: ["web", "manual"],
      soloLectura: true,
      expiraSola: false,
      acciones: [],
    },
    Expirada: {
      codigo: "Expirada",
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
  "PendientePago",
  "PorConfirmar",
  "Confirmada",
  "Atendida",
  "NoAsistida",
  "Cancelada",
  "Expirada",
];

export function definicionEstado(
  codigo: CodigoEstadoCita
): DefinicionEstadoCita {
  return CATALOGO_ESTADOS[codigo];
}
