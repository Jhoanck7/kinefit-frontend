import { ApiResponse } from "@/models/generics";
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
}

export const empresaService = new EmpresaService();
