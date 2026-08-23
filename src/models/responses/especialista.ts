export interface EspecialistaServicioResponse {
  id: number;
  nombre: string;
}

export interface EspecialistaResponse {
  id: number;
  nombre: string;
  cargo: string;
  servicios: EspecialistaServicioResponse[];
  email?: string;
  descripcion?: string;
  activo: boolean;
  mostrarContacto: boolean;
  fotoUrl?: string;
  fotoPublicId?: string;
  fotoAlt?: string;
  biografia?: string;
  fechasDisponibles?: string[];
}

export interface EspecialistaAdminResponse {
  id: number;
  nombre: string;
  cargo: string;
  servicioIds: number[];
  email?: string;
  descripcion?: string;
  fotoUrl?: string;
  activo: boolean;
  mostrarContacto: boolean;
}
