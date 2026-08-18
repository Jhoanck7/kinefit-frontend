import { ApiResponse } from "@/models/generics";
import {
  CreatePacienteManualRequest,
  UpdatePacienteRequest,
} from "@/models/requests";
import {
  PacienteEstadoResponse,
  PacientePerfilResponse,
  PacienteResponse,
  VerificarRutResponse,
} from "@/models/responses";

import { BaseApiService } from "./base-api-service";

export class PacienteService extends BaseApiService {
  constructor() {
    super("/pacientes");
  }

  getAll(busqueda?: string, soloActivos?: boolean) {
    return this.httpClient.get<ApiResponse<PacienteResponse[]>>(this.baseURL, {
      params: { busqueda, soloActivos },
    });
  }

  getById(id: number, page = 1, pageSize = 20) {
    return this.httpClient.get<ApiResponse<PacientePerfilResponse>>(
      `${this.baseURL}/${id}`,
      { params: { page, pageSize } }
    );
  }

  verificarRut(rut: string) {
    return this.httpClient.get<ApiResponse<VerificarRutResponse>>(
      `${this.baseURL}/verificar-rut`,
      { params: { rut } }
    );
  }

  create(data: CreatePacienteManualRequest) {
    return this.httpClient.post<ApiResponse<PacienteResponse>>(
      this.baseURL,
      data
    );
  }

  update(id: number, data: UpdatePacienteRequest) {
    return this.httpClient.put<ApiResponse<PacienteResponse>>(
      `${this.baseURL}/${id}`,
      data
    );
  }

  updateEstado(id: number, activo: boolean) {
    return this.httpClient.patch<ApiResponse<PacienteEstadoResponse>>(
      `${this.baseURL}/${id}/estado`,
      { activo }
    );
  }
}

export const pacienteService = new PacienteService();
