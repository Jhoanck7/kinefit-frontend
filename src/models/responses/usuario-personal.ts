/** Un usuario del personal tal como se muestra en el panel administrativo */
export interface UsuarioPersonalAdminResponse {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  especialistaId?: number;
  especialistaNombre?: string;
  activo: boolean;
  createdAt: string;
}

/** Página de usuarios del personal listados */
export interface UsuariosPersonalPaginadosResponse {
  total: number;
  page: number;
  pageSize: number;
  items: UsuarioPersonalAdminResponse[];
}
