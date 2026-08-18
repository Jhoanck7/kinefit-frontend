import { ApiResponse } from "@/models/generics";
import {
  CreateBloqueoAgendaRequest,
  GenerarAgendaRequest,
} from "@/models/requests";
import {
  BloqueAgendaResponse,
  BloqueoAgendaResponse,
  GeneracionAgendaResultadoResponse,
} from "@/models/responses";

import { BaseApiService } from "./base-api-service";

export class AgendaService extends BaseApiService {
  constructor() {
    super("");
  }

  getAgenda(especialistaIds: number[], desde: string, hasta: string) {
    return this.httpClient.get<ApiResponse<BloqueAgendaResponse[]>>(
      `${this.baseURL}/agenda`,
      { params: { especialistaIds: especialistaIds.join(","), desde, hasta } }
    );
  }

  generar(data: GenerarAgendaRequest) {
    return this.httpClient.post<ApiResponse<GeneracionAgendaResultadoResponse>>(
      `${this.baseURL}/agenda/generar`,
      data
    );
  }

  getBloqueos(especialistaId: number) {
    return this.httpClient.get<ApiResponse<BloqueoAgendaResponse[]>>(
      `${this.baseURL}/bloqueos-agenda`,
      { params: { especialistaId } }
    );
  }

  createBloqueo(data: CreateBloqueoAgendaRequest) {
    return this.httpClient.post<ApiResponse<BloqueoAgendaResponse>>(
      `${this.baseURL}/bloqueos-agenda`,
      data
    );
  }

  revertirBloqueo(id: number) {
    return this.httpClient.patch<ApiResponse<BloqueoAgendaResponse>>(
      `${this.baseURL}/bloqueos-agenda/${id}/revertir`
    );
  }
}

export const agendaService = new AgendaService();
