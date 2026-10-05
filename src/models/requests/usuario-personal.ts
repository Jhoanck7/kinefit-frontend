/** Datos para crear un usuario del personal */
export interface CreateUsuarioPersonalRequest {
  nombre: string;
  email: string;
  rol: string;
  especialistaId?: number;
  password: string;
}

/** Datos para actualizar un usuario del personal */
export interface UpdateUsuarioPersonalRequest {
  nombre: string;
  rol: string;
  especialistaId?: number;
  password?: string;
}
