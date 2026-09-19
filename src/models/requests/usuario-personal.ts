export interface CreateUsuarioPersonalRequest {
  nombre: string;
  email: string;
  rol: string;
  especialistaId?: number;
  password: string;
}

export interface UpdateUsuarioPersonalRequest {
  nombre: string;
  rol: string;
  especialistaId?: number;
  password?: string;
}
