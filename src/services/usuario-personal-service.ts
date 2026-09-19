import { ApiResponse } from "@/models/generics";
import {
  CreateUsuarioPersonalRequest,
  UpdateUsuarioPersonalRequest,
} from "@/models/requests";
import {
  UsuarioPersonalAdminResponse,
  UsuarioPersonalCreadoResponse,
  UsuariosPersonalPaginadosResponse,
} from "@/models/responses";

import { BaseApiService } from "./base-api-service";

export class UsuarioPersonalService extends BaseApiService {
  constructor() {
    super("/usuarios");
  }

  getAll(soloActivos?: boolean, rol?: string) {
    return this.httpClient.get<ApiResponse<UsuariosPersonalPaginadosResponse>>(
      this.baseURL,
      { params: { soloActivos, rol, pageSize: 100 } }
    );
  }

  create(data: CreateUsuarioPersonalRequest) {
    return this.httpClient.post<ApiResponse<UsuarioPersonalCreadoResponse>>(
      this.baseURL,
      data
    );
  }

  update(id: number, data: UpdateUsuarioPersonalRequest) {
    return this.httpClient.put<ApiResponse<UsuarioPersonalAdminResponse>>(
      `${this.baseURL}/${id}`,
      data
    );
  }

  updateEstado(id: number, activo: boolean) {
    return this.httpClient.patch<ApiResponse<UsuarioPersonalAdminResponse>>(
      `${this.baseURL}/${id}/estado`,
      { activo }
    );
  }
}

export const usuarioPersonalService = new UsuarioPersonalService();
