import { ApiResponse } from "@/models/generics";
import { CreateFichaRequest, UpdateFichaRequest } from "@/models/requests";
import {
  FichaAdjuntoResponse,
  FichaResponse,
  FichasPaginadasResponse,
} from "@/models/responses";

import { BaseApiService } from "./base-api-service";

export interface FiltrosFichas {
  busqueda?: string;
  tipoFicha?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  pageSize?: number;
}

export class FichaService extends BaseApiService {
  constructor() {
    super("/fichas");
  }

  getAll(filtros?: FiltrosFichas) {
    return this.httpClient.get<ApiResponse<FichasPaginadasResponse>>(
      this.baseURL,
      { params: filtros }
    );
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<FichaResponse>>(
      `${this.baseURL}/${id}`
    );
  }

  create(data: CreateFichaRequest) {
    return this.httpClient.post<ApiResponse<FichaResponse>>(this.baseURL, data);
  }

  update(id: number, data: UpdateFichaRequest) {
    return this.httpClient.put<ApiResponse<FichaResponse>>(
      `${this.baseURL}/${id}`,
      data
    );
  }

  getHistorialPorPaciente(pacienteId: number) {
    return this.httpClient.get<ApiResponse<FichaResponse[]>>(
      `${this.baseURL}/paciente/${pacienteId}`
    );
  }

  subirAdjunto(fichaId: number, archivo: File) {
    const formData = new FormData();
    formData.append("archivo", archivo);
    return this.httpClient.post<ApiResponse<FichaAdjuntoResponse>>(
      `${this.baseURL}/${fichaId}/adjuntos`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  }

  eliminarAdjunto(adjuntoId: number) {
    return this.httpClient.delete<ApiResponse<null>>(
      `${this.baseURL}/adjuntos/${adjuntoId}`
    );
  }
}

export const fichaService = new FichaService();
