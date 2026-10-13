/** Datos de un usuario del personal */
export interface UsuarioPersonalResponse {
  id: number;
  nombre: string;
  email: string;
  rol: "Administrador" | "Especialista";
  especialistaId?: number;
}

/** Resultado de un login exitoso del personal */
export interface PersonalLoginResponse {
  token: string;
  expiraEn: string;
  usuario: UsuarioPersonalResponse;
}

/** Datos del perfil del usuario autenticado */
export interface MiPerfilResponse {
  nombre: string;
  email: string;
  rol: "Administrador" | "Especialista";
}
