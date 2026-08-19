export interface CreateServicioRequest {
  nombre: string;
  orden: number;
  activo?: boolean;
  imagenPublicId?: string;
  imagenAlt?: string;
  descripcion?: string;
}

export interface UpdateServicioRequest {
  nombre: string;
  orden: number;
  imagenPublicId?: string;
  imagenAlt?: string;
  descripcion?: string;
}
