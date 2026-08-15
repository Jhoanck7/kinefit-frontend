import { apiClient } from "@/lib/api/apiClient";

export interface VentaItemBackendDto {
  id: number;
  tipo: string;
  servicioId?: number | null;
  servicioNombre?: string | null;
  descripcion?: string | null;
  monto: number;
}

export interface VentaBackendDto {
  id: number;
  citaId?: number | null;
  pacienteId?: number | null;
  pacienteNombre?: string | null;
  metodoPago: string;
  terminalPagoId?: number | null;
  terminalNombre?: string | null;
  montoTotal: number;
  creadoPorUsuarioId?: number;
  creadoPorNombre?: string | null;
  fecha?: string;
  createdAt: string;
  items: VentaItemBackendDto[];
  desglose?: {
    montoTotal: number;
    impuesto?: number;
    tasaIvaAplicada?: number;
    comisionTerminal: number;
    porcentajeComisionAplicado?: number;
    montoProfesional?: number;
    montoCentro?: number;
    porcentajeProfesionalAplicado?: number;
  };
}

export interface CreateVentaItemDto {
  tipo: string;
  servicioId?: number | null;
  descripcion?: string | null;
  monto: number;
}

export interface CreateVentaDto {
  citaId?: number | null;
  pacienteId?: number | null;
  metodoPago: "Efectivo" | "Transferencia" | "Debito" | "Credito";
  terminalPagoId?: number | null;
  items: CreateVentaItemDto[];
}

export interface TerminalPagoBackendDto {
  id: number;
  nombre: string;
  plazoAbonoDias: number;
  activo: boolean;
  comisiones?: {
    metodoPago: string;
    porcentaje: number;
  }[];
}

export interface RepartoProfesionalBackendDto {
  id: number;
  especialistaId: number;
  especialistaNombre?: string | null;
  porcentajeProfesional: number;
  porcentajeCentro: number;
  vigenteDesde: string;
}

export const ventaService = {
  async getAll(filtros?: {
    fechaDesde?: string;
    fechaHasta?: string;
    pacienteId?: number;
    metodoPago?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: VentaBackendDto[]; total: number }> {
    const params = new URLSearchParams();
    if (filtros?.fechaDesde) params.append("fechaDesde", filtros.fechaDesde);
    if (filtros?.fechaHasta) params.append("fechaHasta", filtros.fechaHasta);
    if (filtros?.pacienteId)
      params.append("pacienteId", String(filtros.pacienteId));
    if (filtros?.metodoPago && filtros.metodoPago !== "todos")
      params.append("metodoPago", filtros.metodoPago);
    if (filtros?.page) params.append("page", String(filtros.page));
    if (filtros?.pageSize) params.append("pageSize", String(filtros.pageSize));

    const query = params.toString();
    const res = await apiClient.get<unknown>(
      `/ventas${query ? `?${query}` : ""}`
    );

    const raw = (res as { data?: unknown })?.data ?? res;

    if (Array.isArray(raw)) {
      return { data: raw as VentaBackendDto[], total: raw.length };
    }

    if (raw && typeof raw === "object") {
      const items = (raw as { items?: VentaBackendDto[] }).items || [];
      const total =
        (raw as { total?: number; totalCount?: number }).total ??
        (raw as { totalCount?: number }).totalCount ??
        items.length;
      return { data: items, total };
    }

    return { data: [], total: 0 };
  },

  async getById(id: number | string): Promise<VentaBackendDto> {
    const res = await apiClient.get<unknown>(`/ventas/${id}`);
    return ((res as { data?: VentaBackendDto })?.data ??
      res) as VentaBackendDto;
  },

  async create(dto: CreateVentaDto): Promise<VentaBackendDto> {
    const res = await apiClient.post<unknown>("/ventas", dto);
    return ((res as { data?: VentaBackendDto })?.data ??
      res) as VentaBackendDto;
  },

  async getTerminales(): Promise<TerminalPagoBackendDto[]> {
    const res = await apiClient.get<unknown>("/terminales");
    const raw = (res as { data?: unknown })?.data ?? res;
    return Array.isArray(raw) ? (raw as TerminalPagoBackendDto[]) : [];
  },

  async createTerminal(dto: {
    nombre: string;
    plazoAbonoDias?: number;
  }): Promise<TerminalPagoBackendDto> {
    const res = await apiClient.post<unknown>("/terminales", dto);
    return ((res as { data?: TerminalPagoBackendDto })?.data ??
      res) as TerminalPagoBackendDto;
  },

  async getRepartos(): Promise<RepartoProfesionalBackendDto[]> {
    const res = await apiClient.get<unknown>("/reportes/repartos");
    const raw = (res as { data?: unknown })?.data ?? res;
    return Array.isArray(raw) ? (raw as RepartoProfesionalBackendDto[]) : [];
  },

  async createReparto(dto: {
    especialistaId: number;
    porcentajeProfesional: number;
    vigenteDesde?: string;
  }): Promise<RepartoProfesionalBackendDto> {
    const payload = {
      especialistaId: dto.especialistaId,
      porcentajeProfesional: dto.porcentajeProfesional,
      vigenteDesde: dto.vigenteDesde || new Date().toISOString().split("T")[0],
    };
    const res = await apiClient.post<unknown>("/reportes/repartos", payload);
    return ((res as { data?: RepartoProfesionalBackendDto })?.data ??
      res) as RepartoProfesionalBackendDto;
  },
};
