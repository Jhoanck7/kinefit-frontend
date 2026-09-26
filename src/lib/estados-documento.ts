import type { ColorRolEstado } from "@/lib/estados";
import type { TipoDocumentoClinico } from "@/models/responses";

export type CodigoEstadoDocumento =
  | "Borrador"
  | "Pendiente"
  | "Completado"
  | "Bloqueado"
  | "CerradoPorBaja"
  | "Anulado";

export interface DefinicionEstadoDocumento {
  codigo: CodigoEstadoDocumento;
  etiqueta: string;
  colorRol: ColorRolEstado;
}

export const CATALOGO_ESTADOS_DOCUMENTO: Record<
  CodigoEstadoDocumento,
  DefinicionEstadoDocumento
> = {
  Borrador: { codigo: "Borrador", etiqueta: "Borrador", colorRol: "gris" },
  Pendiente: { codigo: "Pendiente", etiqueta: "Pendiente", colorRol: "ambar" },
  Completado: {
    codigo: "Completado",
    etiqueta: "Completado",
    colorRol: "verde",
  },
  Bloqueado: { codigo: "Bloqueado", etiqueta: "Bloqueado", colorRol: "rojo" },
  CerradoPorBaja: {
    codigo: "CerradoPorBaja",
    etiqueta: "Cerrado por Baja",
    colorRol: "rojo",
  },
  Anulado: { codigo: "Anulado", etiqueta: "Anulado", colorRol: "gris" },
};

export const ORDEN_ESTADOS_DOCUMENTO: CodigoEstadoDocumento[] = [
  "Borrador",
  "Pendiente",
  "Completado",
  "Bloqueado",
  "CerradoPorBaja",
  "Anulado",
];

export function definicionEstadoDocumento(
  codigo: string
): DefinicionEstadoDocumento | undefined {
  return CATALOGO_ESTADOS_DOCUMENTO[codigo as CodigoEstadoDocumento];
}

const ESTADOS_CERRADOS: CodigoEstadoDocumento[] = [
  "Completado",
  "Bloqueado",
  "CerradoPorBaja",
  "Anulado",
];

/** Mismo criterio que el backend usa para rechazar adjuntos nuevos. */
export function documentoCerrado(estado: string): boolean {
  return ESTADOS_CERRADOS.includes(estado as CodigoEstadoDocumento);
}

export const CATALOGO_TIPOS_DOCUMENTO: Record<TipoDocumentoClinico, string> = {
  FichaClinica: "Ficha Clínica",
  Recomendacion: "Recomendación",
  Consentimiento: "Consentimiento",
};

export function etiquetaTipoDocumento(tipo: string): string {
  return CATALOGO_TIPOS_DOCUMENTO[tipo as TipoDocumentoClinico] ?? tipo;
}
