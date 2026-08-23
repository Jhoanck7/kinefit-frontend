export interface CreateEspecialistaRequest {
  nombre: string;
  cargo: string;
  servicioIds: number[];
  email?: string;
  descripcion?: string;
  fotoPublicId?: string;
  fotoAlt?: string;
  biografia?: string;
  mostrarContacto?: boolean;
}

export interface UpdateEspecialistaRequest {
  nombre: string;
  cargo: string;
  servicioIds: number[];
  email?: string;
  descripcion?: string;
  fotoPublicId?: string;
  fotoAlt?: string;
  biografia?: string;
  mostrarContacto?: boolean;
}
