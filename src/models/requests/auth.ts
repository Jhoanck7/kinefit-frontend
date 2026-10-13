/** Credenciales de inicio de sesión del personal del panel */
export interface LoginPersonalRequest {
  email: string;
  password: string;
}

/** Datos editables del perfil de un usuario */
export interface UpdatePerfilRequest {
  rut: string;
  telefono: string;
  empresaId?: number;
}
