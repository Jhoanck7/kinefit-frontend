import { ApiResponse } from "@/models/generics";
import {
  CreateHorarioCentroRequest,
  CreatePlantillaHorarioRequest,
} from "@/models/requests";
import {
  HorarioCentroResponse,
  PlantillaHorarioResponse,
} from "@/models/responses";

import { BaseApiService } from "./base-api-service";

export class PlantillaHorarioService extends BaseApiService {
  constructor() {
    super("/plantillas-horario");
  }

  getByEspecialista(especialistaId: number) {
    return this.httpClient.get<ApiResponse<PlantillaHorarioResponse[]>>(
      `${this.baseURL}?especialistaId=${especialistaId}`
    );
  }

  create(data: CreatePlantillaHorarioRequest) {
    return this.httpClient.post<ApiResponse<PlantillaHorarioResponse>>(
      this.baseURL,
      data
    );
  }

  delete(id: number) {
    return this.httpClient.delete<ApiResponse<boolean>>(
      `${this.baseURL}/${id}`
    );
  }
}

export class HorarioCentroService extends BaseApiService {
  constructor() {
    super("/horario-centro");
  }

  getAll() {
    return this.httpClient.get<ApiResponse<HorarioCentroResponse[]>>(
      this.baseURL
    );
  }

  create(data: CreateHorarioCentroRequest) {
    return this.httpClient.post<ApiResponse<HorarioCentroResponse>>(
      this.baseURL,
      data
    );
  }

  delete(id: number) {
    return this.httpClient.delete<ApiResponse<boolean>>(
      `${this.baseURL}/${id}`
    );
  }
}

export const plantillaHorarioService = new PlantillaHorarioService();
export const horarioCentroService = new HorarioCentroService();
