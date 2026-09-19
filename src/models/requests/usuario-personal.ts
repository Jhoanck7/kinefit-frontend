export interface CreateUsuarioPersonalRequest {
  nombre: string;
  email: string;
  rol: string;
  especialistaId?: number;
}

export interface UpdateUsuarioPersonalRequest {
  nombre: string;
  rol: string;
  especialistaId?: number;
}
