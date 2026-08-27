import { ApiResponse } from "@/models/generics";
import { UpdateConfiguracionSistemaRequest } from "@/models/requests";
import { ConfiguracionSistemaResponse } from "@/models/responses";

import { BaseApiService } from "./base-api-service";

export class ConfiguracionSistemaService extends BaseApiService {
  constructor() {
    super("/configuracion");
  }

  getConfig() {
    return this.httpClient.get<ApiResponse<ConfiguracionSistemaResponse>>(
      `${this.baseURL}/sistema`
    );
  }

  updateConfig(data: UpdateConfiguracionSistemaRequest) {
    return this.httpClient.patch<ApiResponse<ConfiguracionSistemaResponse>>(
      `${this.baseURL}/sistema`,
      data
    );
  }
}

export const configuracionSistemaService = new ConfiguracionSistemaService();
