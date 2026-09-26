import type { RespuestaConNombre } from "@/lib/documento-contenido";

export interface FirmarDocumentoRequest {
  huellaMostrada: string;
  contenido?: Record<string, string>;
  documentoFirmadoBase64: string;
}

export interface FirmarProfesionalRequest {
  documentoFirmadoBase64: string;
}

export interface CreateFichaRequest {
  citaId: number;
  plantillaId: number;
  contenido: Record<string, RespuestaConNombre>;
}

export interface UpdateFichaRequest {
  contenido: Record<string, RespuestaConNombre>;
}

export interface EnviarRecomendacionRequest {
  enviar: boolean;
  tipo: "Estandar" | "Personalizada";
  plantillaId?: number;
  contenido?: Record<string, string>;
}
