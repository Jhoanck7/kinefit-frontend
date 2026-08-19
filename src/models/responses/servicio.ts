export interface ServicioResponse {
  id: number;
  nombre: string;
  orden: number;
  activo: boolean;
  imagenUrl?: string;
  imagenPublicId?: string;
  imagenAlt?: string;
  descripcion?: string;
}
