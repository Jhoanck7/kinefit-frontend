import { apiClient } from "@/lib/api/apiClient";

export interface ServicioBackendDto {
  id: number;
  codigo?: string;
  nombre: string;
  duracionMinutos: number;
  ordenPresentacion: number;
  activo: boolean;
}

export interface EspecialistaBackendDto {
  id: number;
  nombre: string;
  cargo: string;
  correo: string;
  telefono: string;
  activo: boolean;
  serviciosAsignados?: number[];
}

export const catalogosService = {
  async getServicios(
    soloActivos: boolean = true
  ): Promise<ServicioBackendDto[]> {
    return apiClient.get<ServicioBackendDto[]>(
      `/servicios?soloActivos=${soloActivos}`
    );
  },

  async createServicio(dto: {
    nombre: string;
    duracionMinutos: number;
    ordenPresentacion: number;
  }): Promise<ServicioBackendDto> {
    return apiClient.post<ServicioBackendDto>("/servicios", dto);
  },

  async getEspecialistas(
    servicioId?: number,
    soloActivos: boolean = true
  ): Promise<EspecialistaBackendDto[]> {
    const params = new URLSearchParams();
    if (servicioId) params.append("servicioId", String(servicioId));
    params.append("soloActivos", String(soloActivos));
    return apiClient.get<EspecialistaBackendDto[]>(
      `/especialistas?${params.toString()}`
    );
  },

  async createEspecialista(dto: {
    nombre: string;
    cargo: string;
    correo: string;
    telefono: string;
    serviciosIds: number[];
  }): Promise<EspecialistaBackendDto> {
    return apiClient.post<EspecialistaBackendDto>("/especialistas", dto);
  },
};
