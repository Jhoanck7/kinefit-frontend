export interface UsuarioPersonalResponse {
  id: number;
  nombre: string;
  email: string;
  rol: "Administrador" | "Especialista";
  especialistaId?: number;
}

export interface PersonalLoginResponse {
  token: string;
  expiraEn: string;
  usuario: UsuarioPersonalResponse;
}
