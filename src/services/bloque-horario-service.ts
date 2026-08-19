import { ApiResponse } from "@/models/generics";
import { FranjaDisponibleResponse } from "@/models/responses";

import { BaseApiService } from "./base-api-service";

export class BloqueHorarioService extends BaseApiService {
  constructor() {
    super("/bloques");
  }

  getDisponibles(especialistaId: number, fecha: string) {
    return this.httpClient.get<ApiResponse<FranjaDisponibleResponse[]>>(
      this.baseURL,
      { params: { especialistaId, fecha } }
    );
  }
}

export const bloqueHorarioService = new BloqueHorarioService();
