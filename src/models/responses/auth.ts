export interface UsuarioPersonalResponse {
  id: number;
  nombre: string;
  email: string;
  rol: "Administrador" | "Especialista";
  especialistaId?: number;
  debeCambiarPassword: boolean;
}

export interface PersonalLoginResponse {
  token: string;
  expiraEn: string;
  usuario: UsuarioPersonalResponse;
}

export interface MiPerfilResponse {
  nombre: string;
  email: string;
  rol: "Administrador" | "Especialista";
  tieneFirma: boolean;
}
