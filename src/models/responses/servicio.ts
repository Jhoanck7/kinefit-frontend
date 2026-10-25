/** Documento (consentimiento o recomendación) exigido por un servicio */
export interface ServicioDocumentoResponse {
  plantillaId: number;
  plantillaNombre: string;
  obligatorio: boolean;
  momento: "TrasConfirmarReserva" | "AlFinalizarAtencion";
}

/** Un servicio ofrecido por el centro */
export interface ServicioResponse {
  id: number;
  nombre: string;
  orden: number;
  activo: boolean;
  duracionMinutos?: number;
  descripcion?: string;
  documentos: ServicioDocumentoResponse[];
}
