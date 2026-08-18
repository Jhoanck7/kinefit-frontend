export interface FichaAdjuntoResponse {
  id: number;
  nombreOriginal: string;
  tipoMime: string;
  tamanoBytes: number;
  subidoPorUsuarioId: number;
  createdAt: string;
}

export interface FichaResponse {
  id: number;
  citaId: number;
  tipo: string;
  tipoNombre: string;
  contenido: Record<string, string>;
  estructuraVersion: number;
  creadoPorUsuarioId: number;
  adjuntos: FichaAdjuntoResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface FichaResumenResponse {
  id: number;
  citaId: number;
  tipo: string;
  tipoNombre: string;
  pacienteId: number;
  pacienteNombre: string;
  pacienteRut?: string;
  fechaAtencion: string;
  creadoPorUsuarioId: number;
  creadoPorNombre?: string;
  createdAt: string;
}

export interface FichasPaginadasResponse {
  total: number;
  page: number;
  pageSize: number;
  items: FichaResumenResponse[];
}
