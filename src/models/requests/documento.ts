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
  contenido: Record<string, string>;
}

export interface UpdateFichaRequest {
  contenido: Record<string, string>;
}

export interface EnviarRecomendacionRequest {
  enviar: boolean;
  tipo: "Estandar" | "Personalizada";
  plantillaId?: number;
  contenido?: Record<string, string>;
}
