import { ApiResponse } from "@/models/generics";
import { AuditoriaCitaResponse } from "@/models/responses";

import { BaseApiService } from "./base-api-service";

/** Consume el endpoint de historial de auditoría de citas */
export class AuditoriaService extends BaseApiService {
  constructor() {
    super("/auditoria");
  }

  getByCitaId(citaId: number) {
    return this.httpClient.get<ApiResponse<AuditoriaCitaResponse[]>>(
      `${this.baseURL}/citas/${citaId}`
    );
  }
}

export const auditoriaService = new AuditoriaService();
