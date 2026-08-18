import { ApiResponse } from "@/models/generics";
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
}

export const servicioService = new ServicioService();
