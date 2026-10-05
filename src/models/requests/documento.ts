import type { RespuestaConNombre } from "@/lib/documento-contenido";

/** Datos para que el paciente firme un documento */
export interface FirmarDocumentoRequest {
  huellaMostrada: string;
  contenido?: Record<string, string>;
  documentoFirmadoBase64: string;
}

/** Datos para que la profesional firme un documento */
export interface FirmarProfesionalRequest {
  documentoFirmadoBase64: string;
}

/** Datos para crear una ficha clínica a partir de una plantilla */
export interface CreateFichaRequest {
  citaId: number;
  plantillaId: number;
  contenido: Record<string, RespuestaConNombre>;
}

/** Datos para actualizar el contenido de una ficha clínica */
export interface UpdateFichaRequest {
  contenido: Record<string, RespuestaConNombre>;
}

/** Datos para enviar o descartar la recomendación de una cita */
export interface EnviarRecomendacionRequest {
  enviar: boolean;
  tipo: "Estandar" | "Personalizada";
  plantillaId?: number;
  contenido?: Record<string, string>;
}
