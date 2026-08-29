export interface ServicioDocumentoResponse {
  formatoFichaId: number;
  formatoFichaNombre: string;
  obligatorio: boolean;
  momento: "TrasConfirmarReserva" | "AlFinalizarAtencion";
  vigenciaDias?: number;
}

export interface ServicioResponse {
  id: number;
  nombre: string;
  orden: number;
  activo: boolean;
  duracionMinutos?: number;
  imagenUrl?: string;
  imagenPublicId?: string;
  imagenAlt?: string;
  descripcion?: string;
  documentos: ServicioDocumentoResponse[];
}
