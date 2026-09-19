export interface UsuarioPersonalAdminResponse {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  especialistaId?: number;
  especialistaNombre?: string;
  activo: boolean;
  debeCambiarPassword: boolean;
  createdAt: string;
}

export interface UsuariosPersonalPaginadosResponse {
  total: number;
  page: number;
  pageSize: number;
  items: UsuarioPersonalAdminResponse[];
}

export interface UsuarioPersonalCreadoResponse {
  usuario: UsuarioPersonalAdminResponse;
  passwordTemporal: string;
  advertencia: string;
}
