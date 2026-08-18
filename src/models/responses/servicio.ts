export interface ServicioResponse {
  id: number;
  nombre: string;
  duracionMinutos?: number;
  orden: number;
  activo: boolean;
  imagenUrl?: string;
  imagenAlt?: string;
  descripcion?: string;
}
