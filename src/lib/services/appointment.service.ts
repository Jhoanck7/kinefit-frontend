import { apiClient } from '@/lib/api/apiClient';
import { 
  BackendService, 
  BackendSpecialist, 
  BackendTimeSlot, 
  CreateCitaDto, 
  CitaResponseData 
} from '@/types';

export const appointmentService = {
  async getServices(soloActivos = true): Promise<{ data: BackendService[] }> {
    return apiClient.get<{ data: BackendService[] }>(`/servicios?soloActivos=${soloActivos}`);
  },

  async getEspecialistas(servicioId?: number, soloActivos = true): Promise<{ data: BackendSpecialist[] }> {
    const queryParams = new URLSearchParams();
    if (servicioId) queryParams.append('servicioId', servicioId.toString());
    queryParams.append('soloActivos', soloActivos.toString());

    return apiClient.get<{ data: BackendSpecialist[] }>(`/especialistas?${queryParams.toString()}`);
  },

  async getBloques(especialistaId: number, fecha: string): Promise<{ data: BackendTimeSlot[] }> {
    return apiClient.get<{ data: BackendTimeSlot[] }>(`/bloques?especialistaId=${especialistaId}&fecha=${fecha}`);
  },

  async crearCita(dto: CreateCitaDto, token: string): Promise<{ data: CitaResponseData }> {
    return apiClient.post<{ data: CitaResponseData }>('/citas', dto, undefined, token);
  }
};
