export interface CreateFichaRequest {
  citaId: number;
  tipo?: string;
  formatoFichaId?: number;
  contenido: Record<string, string>;
}

export interface UpdateFichaRequest {
  contenido: Record<string, string>;
}
