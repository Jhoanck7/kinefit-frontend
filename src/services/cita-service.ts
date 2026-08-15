import { ApiResponse } from "@/models/generics";
import {
  CreateCitaManualRequest,
  UpdateCitaEstadoRequest,
} from "@/models/requests";
import {
  CitaCreadaResponse,
  CitaDetalleResponse,
  CitaEstadoActualizadoResponse,
  CitasPaginadasResponse,
  ImpactoCancelacionResponse,
} from "@/models/responses";

import { BaseApiService } from "./base-api-service";

export interface FiltrosCitas {
  especialistaId?: number;
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  pageSize?: number;
}

export class CitaService extends BaseApiService {
  constructor() {
    super("/citas");
  }

  getAll(filtros?: FiltrosCitas) {
    return this.httpClient.get<ApiResponse<CitasPaginadasResponse>>(
      this.baseURL,
      { params: filtros }
    );
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<CitaDetalleResponse>>(
      `${this.baseURL}/${id}`
    );
  }

  createManual(data: CreateCitaManualRequest) {
    return this.httpClient.post<ApiResponse<CitaCreadaResponse>>(
      `${this.baseURL}/manual`,
      data
    );
  }

  updateEstado(id: number, data: UpdateCitaEstadoRequest) {
    return this.httpClient.patch<ApiResponse<CitaEstadoActualizadoResponse>>(
      `${this.baseURL}/${id}/estado`,
      data
    );
  }

  getImpactoCancelacion(id: number) {
    return this.httpClient.get<ApiResponse<ImpactoCancelacionResponse>>(
      `${this.baseURL}/${id}/impacto-cancelacion`
    );
  }
}

export const citaService = new CitaService();
