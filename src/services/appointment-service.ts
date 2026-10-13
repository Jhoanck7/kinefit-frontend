import { CreateCitaPublicaRequest } from "@/models/requests";
import { FranjaDisponibleResponse, ServicioResponse } from "@/models/responses";
import { axiosInstanceSinSesion } from "@/providers";

import { BaseApiService } from "./base-api-service";

/** Consume los endpoints públicos de reserva: servicios, bloques disponibles y creación de citas */
export class AppointmentService extends BaseApiService {
  constructor() {
    super("", axiosInstanceSinSesion);
  }

  getServices(soloActivos = true) {
    return this.httpClient.get<{ data: ServicioResponse[] }>(
      `${this.baseURL}/servicios`,
      { params: { soloActivos } }
    );
  }

  getBloques(especialistaId: number, fecha: string) {
    return this.httpClient.get<{ data: FranjaDisponibleResponse[] }>(
      `${this.baseURL}/bloques`,
      { params: { especialistaId, fecha } }
    );
  }

  crearCita(dto: CreateCitaPublicaRequest, token?: string) {
    return this.httpClient.post<{ data: { citaId: number } }>(
      `${this.baseURL}/citas`,
      dto,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
  }
}

export const appointmentService = new AppointmentService();
