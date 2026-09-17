export interface LoginPersonalRequest {
  email: string;
  password: string;
}

export interface CambiarPasswordRequest {
  passwordActual: string;
  passwordNueva: string;
}

export interface UpdatePerfilRequest {
  rut: string;
  telefono: string;
  empresaId?: number;
}
