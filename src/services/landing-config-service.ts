import { ApiResponse } from "@/models/generics";
import { UpdateLandingConfigRequest } from "@/models/requests";
import { LandingConfigResponse } from "@/models/responses";

import { BaseApiService } from "./base-api-service";

export class LandingConfigService extends BaseApiService {
  constructor() {
    super("/configuracion");
  }

  getConfig() {
    return this.httpClient.get<ApiResponse<LandingConfigResponse>>(
      `${this.baseURL}/landing`
    );
  }

  updateConfig(data: UpdateLandingConfigRequest) {
    return this.httpClient.put<ApiResponse<LandingConfigResponse>>(
      `${this.baseURL}/landing`,
      data
    );
  }

  patchConfig(data: Partial<UpdateLandingConfigRequest>) {
    return this.httpClient.patch<ApiResponse<LandingConfigResponse>>(
      `${this.baseURL}/landing`,
      data
    );
  }

  sincronizarGoogleReviews(limite: number = 5) {
    return this.httpClient.post<ApiResponse<LandingConfigResponse>>(
      `${this.baseURL}/sincronizar-google-reviews`,
      null,
      { params: { limite } }
    );
  }
}

export const landingConfigService = new LandingConfigService();
