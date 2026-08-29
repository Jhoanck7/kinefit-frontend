export interface LoginPersonalRequest {
  email: string;
  password: string;
}

export interface CambiarPasswordRequest {
  passwordActual: string;
  nuevaPassword: string;
}

export interface UpdatePerfilRequest {
  rut: string;
  telefono: string;
}

export interface GuardarFirmaRequest {
  firmaBase64: string;
}
