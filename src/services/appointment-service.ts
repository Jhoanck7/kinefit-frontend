import { BackendService, BackendTimeSlot, CreateCitaDto } from "@/types";

import { BaseApiService } from "./base-api-service";

export class AppointmentService extends BaseApiService {
  constructor() {
    super("");
  }

  getServices(soloActivos = true) {
    return this.httpClient.get<{ data: BackendService[] }>(
      `${this.baseURL}/servicios`,
      { params: { soloActivos } }
    );
  }

  getBloques(especialistaId: number, fecha: string) {
    return this.httpClient.get<{ data: BackendTimeSlot[] }>(
      `${this.baseURL}/bloques`,
      { params: { especialistaId, fecha } }
    );
  }

  crearCita(dto: CreateCitaDto, token?: string) {
    return this.httpClient.post<{ data: { citaId: number } }>(
      `${this.baseURL}/citas`,
      dto,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
  }
}

export const appointmentService = new AppointmentService();
