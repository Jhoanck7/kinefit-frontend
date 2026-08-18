import { ApiResponse } from "@/models/generics";
import { EspecialistaResponse } from "@/models/responses";

import { BaseApiService } from "./base-api-service";

export class DisponibilidadService extends BaseApiService {
  constructor() {
    super("/disponibilidad");
  }

  getFechas(servicioId: number, duracionMinutos: number) {
    return this.httpClient.get<ApiResponse<string[]>>(
      `${this.baseURL}/fechas`,
      { params: { servicioId, duracionMinutos } }
    );
  }

  getHoras(servicioId: number, fecha: string, duracionMinutos: number) {
    return this.httpClient.get<ApiResponse<string[]>>(`${this.baseURL}/horas`, {
      params: { servicioId, fecha, duracionMinutos },
    });
  }

  getEspecialistas(
    servicioId: number,
    fecha: string,
    horaInicio: string,
    duracionMinutos: number
  ) {
    return this.httpClient.get<ApiResponse<EspecialistaResponse[]>>(
      `${this.baseURL}/especialistas`,
      { params: { servicioId, fecha, horaInicio, duracionMinutos } }
    );
  }
}

export const disponibilidadService = new DisponibilidadService();
