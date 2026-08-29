export interface CreateServicioRequest {
  nombre: string;
  orden: number;
  activo?: boolean;
  duracionMinutos?: number;
  imagenPublicId?: string;
  imagenAlt?: string;
  descripcion?: string;
}

export interface UpdateServicioRequest {
  nombre: string;
  orden: number;
  duracionMinutos?: number;
  imagenPublicId?: string;
  imagenAlt?: string;
  descripcion?: string;
}

export interface ServicioDocumentoInput {
  formatoFichaId: number;
  obligatorio: boolean;
  momento: "TrasConfirmarReserva" | "AlFinalizarAtencion";
  vigenciaDias?: number;
}
