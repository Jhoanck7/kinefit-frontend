import { ApiResponse } from "@/models/generics";
import {
  CreateServicioRequest,
  ServicioDocumentoInput,
  UpdateServicioRequest,
} from "@/models/requests";
import { ServicioResponse } from "@/models/responses";

import { BaseApiService } from "./base-api-service";

export class ServicioService extends BaseApiService {
  constructor() {
    super("/servicios");
  }

  getAll(soloActivos = true) {
    return this.httpClient.get<ApiResponse<ServicioResponse[]>>(this.baseURL, {
      params: { soloActivos },
    });
  }

  create(data: CreateServicioRequest) {
    return this.httpClient.post<ApiResponse<ServicioResponse>>(
      this.baseURL,
      data
    );
  }

  update(id: number, data: UpdateServicioRequest) {
    return this.httpClient.put<ApiResponse<ServicioResponse>>(
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

  actualizarDocumentos(id: number, documentos: ServicioDocumentoInput[]) {
    return this.httpClient.put<ApiResponse<ServicioResponse>>(
      `${this.baseURL}/${id}/documentos`,
      documentos
    );
  }
}

export const servicioService = new ServicioService();
