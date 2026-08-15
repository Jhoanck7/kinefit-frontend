import { ApiResponse } from "@/models/generics";
import {
  CreateEspecialistaRequest,
  UpdateEspecialistaRequest,
} from "@/models/requests";
import {
  EspecialistaAdminResponse,
  EspecialistaResponse,
} from "@/models/responses";

import { BaseApiService } from "./base-api-service";

export class EspecialistaService extends BaseApiService {
  constructor() {
    super("/especialistas");
  }

  getEspecialistas(servicioId?: number, soloActivos = false) {
    return this.httpClient.get<ApiResponse<EspecialistaResponse[]>>(
      this.baseURL,
      { params: { servicioId, soloActivos } }
    );
  }

  createEspecialista(data: CreateEspecialistaRequest) {
    return this.httpClient.post<ApiResponse<EspecialistaAdminResponse>>(
      this.baseURL,
      data
    );
  }

  updateEspecialista(id: number, data: UpdateEspecialistaRequest) {
    return this.httpClient.put<ApiResponse<EspecialistaAdminResponse>>(
      `${this.baseURL}/${id}`,
      data
    );
  }

  updateEstado(id: number, activo: boolean) {
    return this.httpClient.patch<ApiResponse<{ id: number; activo: boolean }>>(
      `${this.baseURL}/${id}/estado`,
      { activo }
    );
  }

  deleteEspecialista(id: number) {
    return this.httpClient.delete<ApiResponse<boolean>>(
      `${this.baseURL}/${id}`
    );
  }
}

export const especialistaService = new EspecialistaService();
