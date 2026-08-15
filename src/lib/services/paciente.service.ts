import { apiClient } from "@/lib/api/apiClient";

export interface PacienteBackendDto {
  id: number;
  nombre: string;
  apellido: string;
  rut: string;
  correo?: string;
  email?: string;
  telefono?: string;
  convenioId?: number | null;
  convenioNombre?: string | null;
  origenRegistro: "web" | "manual";
  activo: boolean;
  creadoEn: string;
}

export interface CreatePacienteManualDto {
  nombre: string;
  apellido: string;
  rut: string;
  email: string;
  correo?: string;
  telefono?: string;
  empresaId?: number | null;
  convenioId?: number | null;
}

export interface UpdatePacienteDto {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  empresaId?: number | null;
}

export const pacienteService = {
  async getAll(
    busqueda?: string,
    soloActivos?: boolean
  ): Promise<PacienteBackendDto[]> {
    const params = new URLSearchParams();
    if (busqueda) params.append("busqueda", busqueda);
    if (soloActivos !== undefined)
      params.append("soloActivos", String(soloActivos));
    const query = params.toString();
    const res = await apiClient.get<unknown>(
      `/pacientes${query ? `?${query}` : ""}`
    );
    const obj = (res as { data?: unknown })?.data ?? res;
    if (Array.isArray(obj)) return obj as PacienteBackendDto[];
    if (
      obj &&
      typeof obj === "object" &&
      "items" in obj &&
      Array.isArray((obj as { items: unknown }).items)
    ) {
      return (obj as { items: PacienteBackendDto[] }).items;
    }
    return [];
  },

  async getById(id: number | string): Promise<PacienteBackendDto> {
    const res = await apiClient.get<unknown>(`/pacientes/${id}`);
    return ((res as { data?: PacienteBackendDto })?.data ??
      res) as PacienteBackendDto;
  },

  async verificarRut(
    rut: string
  ): Promise<{ existe: boolean; paciente?: PacienteBackendDto }> {
    const res = await apiClient.get<unknown>(
      `/pacientes/verificar-rut?rut=${encodeURIComponent(rut)}`
    );
    return ((
      res as { data?: { existe: boolean; paciente?: PacienteBackendDto } }
    )?.data ?? res) as {
      existe: boolean;
      paciente?: PacienteBackendDto;
    };
  },

  async create(dto: CreatePacienteManualDto): Promise<PacienteBackendDto> {
    const payload = {
      nombre: dto.nombre,
      apellido: dto.apellido,
      rut: dto.rut,
      email: dto.email || dto.correo || "",
      telefono: dto.telefono || "",
      empresaId: dto.empresaId || dto.convenioId || null,
    };
    const res = await apiClient.post<unknown>("/pacientes", payload);
    return ((res as { data?: PacienteBackendDto })?.data ??
      res) as PacienteBackendDto;
  },

  async update(
    id: number | string,
    dto: UpdatePacienteDto
  ): Promise<PacienteBackendDto> {
    const res = await apiClient.put<unknown>(`/pacientes/${id}`, dto);
    return ((res as { data?: PacienteBackendDto })?.data ??
      res) as PacienteBackendDto;
  },

  async updateEstado(id: number | string, activo: boolean): Promise<void> {
    return apiClient.patch<void>(`/pacientes/${id}/estado`, { activo });
  },
};
