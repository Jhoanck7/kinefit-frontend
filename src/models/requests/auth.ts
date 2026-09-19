export interface LoginPersonalRequest {
  email: string;
  password: string;
}

export interface UpdatePerfilRequest {
  rut: string;
  telefono: string;
  empresaId?: number;
}
