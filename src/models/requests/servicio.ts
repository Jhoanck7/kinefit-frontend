/** Datos para crear un servicio */
export interface CreateServicioRequest {
  nombre: string;
  orden: number;
  activo?: boolean;
  duracionMinutos?: number;
  descripcion?: string;
}

/** Datos para actualizar un servicio */
export interface UpdateServicioRequest {
  nombre: string;
  orden: number;
  duracionMinutos?: number;
  descripcion?: string;
}

/** Documento (consentimiento o recomendación) exigido por un servicio */
export interface ServicioDocumentoInput {
  plantillaId: number;
  obligatorio: boolean;
  momento: "TrasConfirmarReserva" | "AlFinalizarAtencion";
}
