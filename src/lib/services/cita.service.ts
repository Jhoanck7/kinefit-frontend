import { apiClient } from '@/lib/api/apiClient';

export interface CitaBackendDto {
  id: number;
  pacienteId?: number;
  pacienteNombre?: string;
  pacienteRut?: string;
  especialistaId?: number;
  especialistaNombre?: string;
  especialista?: unknown;
  servicioId?: number;
  servicioNombre?: string;
  servicio?: unknown;
  fecha: string;
  horaInicio: string;
  horaTermino?: string;
  horaFin?: string;
  estado: string;
  origen?: 'Web' | 'Manual';
  notas?: string | null;
  notaPaciente?: string | null;
  notaInterna?: string | null;
  creadaEn?: string;
  createdAt?: string;
  paciente?: {
    id?: number;
    nombre?: string;
    apellido?: string;
    rut?: string;
    email?: string;
    telefono?: string;
  };
  transaccion?: {
    id?: number;
    monto?: number;
    buyOrder?: string;
    estado?: string;
  } | null;
}

export interface CreateCitaManualDto {
  pacienteId: number;
  especialistaId: number;
  servicioId: number;
  bloqueHorarioId: number;
  empresaId?: number;
  notaPaciente?: string;
  notaInterna?: string;
}

export const citaService = {
  async getAll(filtros?: {
    especialistaId?: number;
    estado?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: CitaBackendDto[]; total: number }> {
    const params = new URLSearchParams();
    if (filtros?.especialistaId) params.append('especialistaId', String(filtros.especialistaId));
    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros?.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
    if (filtros?.page) params.append('page', String(filtros.page));
    if (filtros?.pageSize) params.append('pageSize', String(filtros.pageSize));

    const query = params.toString();
    const res = await apiClient.get<unknown>(`/citas${query ? `?${query}` : ''}`);

    const raw = (res as { data?: unknown })?.data ?? res;

    if (Array.isArray(raw)) {
      return { data: raw as CitaBackendDto[], total: raw.length };
    }

    if (raw && typeof raw === 'object') {
      const items = (raw as { items?: CitaBackendDto[] }).items || [];
      const total = (raw as { totalItems?: number; totalCount?: number }).totalItems ?? items.length;
      return { data: items, total };
    }

    return { data: [], total: 0 };
  },

  async getById(id: number | string): Promise<CitaBackendDto> {
    const res = await apiClient.get<unknown>(`/citas/${id}`);
    return ((res as { data?: CitaBackendDto })?.data ?? res) as CitaBackendDto;
  },

  async createManual(dto: CreateCitaManualDto): Promise<CitaBackendDto> {
    const res = await apiClient.post<unknown>('/citas/manual', dto);
    return ((res as { data?: CitaBackendDto })?.data ?? res) as CitaBackendDto;
  },

  async updateEstado(
    id: number | string,
    estadoNuevo: string,
    motivo?: string,
    confirmadoPor?: string
  ): Promise<CitaBackendDto> {
    const res = await apiClient.patch<unknown>(`/citas/${id}/estado`, {
      estadoNuevo,
      motivo,
      confirmadoPor: confirmadoPor || (estadoNuevo === 'Confirmada' ? 'Profesional' : undefined),
    });
    return ((res as { data?: CitaBackendDto })?.data ?? res) as CitaBackendDto;
  },

  async getImpactoCancelacion(id: number | string): Promise<{ afectaAfectaciones: boolean; mensaje: string }> {
    const res = await apiClient.get<unknown>(`/citas/${id}/impacto-cancelacion`);
    return ((res as { data?: { afectaAfectaciones: boolean; mensaje: string } })?.data ?? res) as {
      afectaAfectaciones: boolean;
      mensaje: string;
    };
  },
};
