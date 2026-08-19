import { ApiResponse } from "@/models/generics";
import { CreateEmpresaRequest, UpdateEmpresaRequest } from "@/models/requests";
import { EmpresaResponse } from "@/models/responses";

import { BaseApiService } from "./base-api-service";

export class EmpresaService extends BaseApiService {
  constructor() {
    super("/empresas");
  }

  getAll(soloActivos = true) {
    return this.httpClient.get<ApiResponse<EmpresaResponse[]>>(this.baseURL, {
      params: { soloActivos },
    });
  }

  create(data: CreateEmpresaRequest) {
    return this.httpClient.post<ApiResponse<EmpresaResponse>>(
      this.baseURL,
      data
    );
  }

  update(id: number, data: UpdateEmpresaRequest) {
    return this.httpClient.put<ApiResponse<EmpresaResponse>>(
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
}

export const empresaService = new EmpresaService();
