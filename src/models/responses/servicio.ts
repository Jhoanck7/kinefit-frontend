export interface ServicioDocumentoResponse {
  plantillaId: number;
  plantillaNombre: string;
  obligatorio: boolean;
  momento: "TrasConfirmarReserva" | "AlFinalizarAtencion";
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
