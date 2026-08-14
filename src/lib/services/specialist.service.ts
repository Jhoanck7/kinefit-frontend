import { apiClient } from "@/lib/api/apiClient";
import { BackendSpecialist } from "@/types";

export const specialistService = {
  async getEspecialistas(
    servicioId?: number,
    soloActivos = false
  ): Promise<BackendSpecialist[]> {
    const queryParams = new URLSearchParams();
    if (servicioId) queryParams.append("servicioId", servicioId.toString());
    queryParams.append("soloActivos", soloActivos.toString());

    const response = await apiClient.get<{ data: BackendSpecialist[] }>(
      `/especialistas?${queryParams.toString()}`
    );
    return response.data;
  },

  async createEspecialista(
    data: {
      nombre: string;
      cargo: string;
      servicioId?: number;
      email?: string;
      descripcion?: string;
      fotoUrl?: string;
    },
    apiKey = "KineFitSecretTokenDev2026"
  ): Promise<BackendSpecialist> {
    const response = await apiClient.post<{ data: BackendSpecialist }>(
      "/especialistas",
      data,
      undefined,
      undefined,
      apiKey
    );
    return response.data;
  },

  async updateFoto(
    id: number,
    fotoUrl: string,
    apiKey = "KineFitSecretTokenDev2026"
  ): Promise<BackendSpecialist> {
    const response = await apiClient.patch<{ data: BackendSpecialist }>(
      `/especialistas/${id}/foto`,
      { fotoUrl },
      undefined,
      undefined,
      apiKey
    );
    return response.data;
  },

  async updateEspecialista(
    id: number,
    data: {
      nombre: string;
      cargo: string;
      servicioId?: number;
      email?: string;
      descripcion?: string;
      fotoUrl?: string;
    },
    apiKey = "KineFitSecretTokenDev2026"
  ): Promise<BackendSpecialist> {
    const response = await apiClient.put<{ data: BackendSpecialist }>(
      `/especialistas/${id}`,
      data,
      undefined,
      undefined,
      apiKey
    );
    return response.data;
  },

  async updateEstado(
    id: number,
    activo: boolean,
    apiKey = "KineFitSecretTokenDev2026"
  ): Promise<{ id: number; activo: boolean }> {
    const response = await apiClient.patch<{
      data: { id: number; activo: boolean };
    }>(`/especialistas/${id}/estado`, { activo }, undefined, undefined, apiKey);
    return response.data;
  },

  async deleteEspecialista(
    id: number,
    apiKey = "KineFitSecretTokenDev2026"
  ): Promise<boolean> {
    await apiClient.delete<{ data: boolean }>(
      `/especialistas/${id}`,
      undefined,
      undefined,
      apiKey
    );
    return true;
  },
};
