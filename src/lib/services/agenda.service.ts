import { apiClient } from '@/lib/api/apiClient';

export interface BloqueHorarioBackendDto {
  id: number;
  especialistaId: number;
  fecha: string;
  horaInicio: string;
  horaTermino: string;
  estado: 'Disponible' | 'Reservado' | 'Bloqueado';
  citaId?: number | null;
  bloqueoId?: number | null;
}

export interface BloqueoAgendaBackendDto {
  id: number;
  especialistaId: number;
  especialistaNombre?: string;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  creadoEn: string;
  revertido: boolean;
}

export interface CreateBloqueoAgendaDto {
  especialistaId: number;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
}

export const agendaService = {
  async getAgenda(especialistaIds: number[], desde: string, hasta: string): Promise<BloqueHorarioBackendDto[]> {
    const idsStr = especialistaIds.join(',');
    return apiClient.get<BloqueHorarioBackendDto[]>(
      `/agenda?especialistaIds=${encodeURIComponent(idsStr)}&desde=${desde}&hasta=${hasta}`
    );
  },

  async generar(desde: string, hasta: string, especialistaId?: number): Promise<{ creados: number }> {
    return apiClient.post<{ creados: number }>('/agenda/generar', {
      desde,
      hasta,
      especialistaId,
    });
  },

  async getBloqueos(especialistaId: number): Promise<BloqueoAgendaBackendDto[]> {
    return apiClient.get<BloqueoAgendaBackendDto[]>(`/bloqueos-agenda?especialistaId=${especialistaId}`);
  },

  async createBloqueo(dto: CreateBloqueoAgendaDto): Promise<BloqueoAgendaBackendDto> {
    return apiClient.post<BloqueoAgendaBackendDto>('/bloqueos-agenda', dto);
  },

  async revertirBloqueo(id: number | string): Promise<BloqueoAgendaBackendDto> {
    return apiClient.patch<BloqueoAgendaBackendDto>(`/bloqueos-agenda/${id}/revertir`);
  },
};
