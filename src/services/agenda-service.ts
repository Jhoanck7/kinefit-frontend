import { ApiResponse } from "@/models/generics";
import {
  CreateBloqueoAgendaRequest,
  CreateBloqueoAgendaTodosRequest,
} from "@/models/requests";
import {
  BloqueAgendaResponse,
  BloqueoAgendaResponse,
  BloqueoAgendaTodosResponse,
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

  createBloqueoParaTodos(data: CreateBloqueoAgendaTodosRequest) {
    return this.httpClient.post<ApiResponse<BloqueoAgendaTodosResponse>>(
      `${this.baseURL}/bloqueos-agenda/todos`,
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
