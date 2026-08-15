import { apiClient } from "@/lib/api/apiClient";

export interface AdjuntoBackendDto {
  id: number;
  nombreOriginal: string;
  tipoMime?: string;
  tamanoBytes?: number;
  subidoEn?: string;
  createdAt?: string;
}

export interface FichaBackendDto {
  id: number;
  citaId: number;
  citaFecha?: string;
  citaHoraInicio?: string;
  citaHoraTermino?: string;
  pacienteId?: number;
  pacienteNombre?: string;
  pacienteRut?: string;
  formatoId?: string;
  tipoFicha?: string;
  tipo: string;
  tipoNombre?: string;
  registradaPor?: string;
  creadoPorNombre?: string;
  createdAt?: string;
  creadaEn?: string;
  servicioNombre?: string;
  especialistaId?: number;
  creadoPorUsuarioId?: number;
  contenido: Record<string, string>;
  adjuntos: AdjuntoBackendDto[];
}

export interface CreateFichaDto {
  citaId: number;
  tipo?: string;
  contenido: Record<string, string>;
}

export interface UpdateFichaDto {
  contenido: Record<string, string>;
}

export const fichaService = {
  async getAll(filtros?: {
    busqueda?: string;
    tipoFicha?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: FichaBackendDto[]; total: number }> {
    const params = new URLSearchParams();
    if (filtros?.busqueda) params.append("busqueda", filtros.busqueda);
    if (filtros?.tipoFicha) params.append("tipoFicha", filtros.tipoFicha);
    if (filtros?.fechaDesde) params.append("fechaDesde", filtros.fechaDesde);
    if (filtros?.fechaHasta) params.append("fechaHasta", filtros.fechaHasta);
    if (filtros?.page) params.append("page", String(filtros.page));
    if (filtros?.pageSize) params.append("pageSize", String(filtros.pageSize));

    const query = params.toString();
    const res = await apiClient.get<unknown>(
      `/fichas${query ? `?${query}` : ""}`
    );

    const raw = (res as { data?: unknown })?.data ?? res;

    if (Array.isArray(raw)) {
      return { data: raw as FichaBackendDto[], total: raw.length };
    }

    if (raw && typeof raw === "object") {
      const items = (raw as { items?: FichaBackendDto[] }).items || [];
      const total =
        (raw as { total?: number; totalCount?: number }).total ??
        (raw as { totalCount?: number }).totalCount ??
        items.length;
      return { data: items, total };
    }

    return { data: [], total: 0 };
  },

  async getById(id: number | string): Promise<FichaBackendDto> {
    const res = await apiClient.get<unknown>(`/fichas/${id}`);
    return ((res as { data?: FichaBackendDto })?.data ??
      res) as FichaBackendDto;
  },

  async create(dto: CreateFichaDto): Promise<FichaBackendDto> {
    const payload = {
      citaId: dto.citaId,
      tipo: dto.tipo || "FichaClinica",
      contenido: dto.contenido || {},
    };
    const res = await apiClient.post<unknown>("/fichas", payload);
    return ((res as { data?: FichaBackendDto })?.data ??
      res) as FichaBackendDto;
  },

  async update(
    id: number | string,
    dto: UpdateFichaDto
  ): Promise<FichaBackendDto> {
    const res = await apiClient.put<unknown>(`/fichas/${id}`, dto);
    return ((res as { data?: FichaBackendDto })?.data ??
      res) as FichaBackendDto;
  },

  async getHistorialPorPaciente(
    pacienteId: number | string
  ): Promise<FichaBackendDto[]> {
    const res = await apiClient.get<unknown>(`/fichas/paciente/${pacienteId}`);
    const raw = (res as { data?: unknown })?.data ?? res;
    return Array.isArray(raw) ? (raw as FichaBackendDto[]) : [];
  },

  async subirAdjunto(
    id: number | string,
    archivo: File
  ): Promise<AdjuntoBackendDto> {
    const formData = new FormData();
    formData.append("archivo", archivo);
    const res = await apiClient.post<unknown>(
      `/fichas/${id}/adjuntos`,
      formData
    );
    return ((res as { data?: AdjuntoBackendDto })?.data ??
      res) as AdjuntoBackendDto;
  },

  async eliminarAdjunto(adjuntoId: number | string): Promise<void> {
    return apiClient.delete<void>(`/fichas/adjuntos/${adjuntoId}`);
  },
};
