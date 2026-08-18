export interface CreateFichaRequest {
  citaId: number;
  tipo?: string;
  contenido: Record<string, string>;
}

export interface UpdateFichaRequest {
  contenido: Record<string, string>;
}
