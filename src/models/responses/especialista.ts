/** Datos del servicio tal como se muestran en el contexto de un especialista */
export interface EspecialistaServicioResponse {
  id: number;
  nombre: string;
}

/** Un especialista tal como se muestra en el sitio público */
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
  tieneHorario: boolean;
}

/** Un especialista tal como se muestra en el panel administrativo */
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

/** Resultado de activar o desactivar un especialista */
export interface EspecialistaEstadoResponse {
  id: number;
  activo: boolean;
  advertencia?: string;
  citasVigentes?: number;
}
