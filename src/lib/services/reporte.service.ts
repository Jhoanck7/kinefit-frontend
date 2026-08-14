import { apiClient } from "@/lib/api/apiClient";

export interface ReporteVentasResponseDto {
  montoTotalVendido: number;
  totalTransacciones: number;
  ticketPromedio: number;
  ventasPorMetodo: Array<{
    metodoPago: string;
    monto: number;
    cantidad: number;
  }>;
  movimientos: Array<{
    id: number;
    fecha: string;
    monto: number;
    metodoPago: string;
    pacienteId: number;
    pacienteNombre: string;
  }>;
}

export interface ReporteReservasResponseDto {
  totalReservas: number;
  atendidas: number;
  canceladas: number;
  noAsistidas: number;
  tasaOcupacionPorcentaje: number;
  distribucionPorServicio: Array<{ servicio: string; cantidad: number }>;
}

export interface ReporteComisionesResponseDto {
  totalComisionesPagar: number;
  comisionesPorEspecialista: Array<{
    especialistaId: number;
    especialistaNombre: string;
    totalAtenciones: number;
    montoTotalGenerado: number;
    porcentajeComision: number;
    montoComisionPagar: number;
  }>;
}

export const reporteService = {
  async getReporteVentas(filtros?: {
    fechaDesde?: string;
    fechaHasta?: string;
    clienteId?: number;
    metodoPago?: string;
    formato?: string;
  }): Promise<ReporteVentasResponseDto> {
    const params = new URLSearchParams();
    if (filtros?.fechaDesde) params.append("fechaDesde", filtros.fechaDesde);
    if (filtros?.fechaHasta) params.append("fechaHasta", filtros.fechaHasta);
    if (filtros?.clienteId)
      params.append("clienteId", String(filtros.clienteId));
    if (filtros?.metodoPago && filtros.metodoPago !== "todos")
      params.append("metodoPago", filtros.metodoPago);
    if (filtros?.formato) params.append("formato", filtros.formato);

    const query = params.toString();
    return apiClient.get<ReporteVentasResponseDto>(
      `/reportes/ventas${query ? `?${query}` : ""}`
    );
  },

  async getReporteReservas(filtros?: {
    fechaDesde?: string;
    fechaHasta?: string;
    compararCon?: boolean;
    vista?: string;
  }): Promise<ReporteReservasResponseDto> {
    const params = new URLSearchParams();
    if (filtros?.fechaDesde) params.append("fechaDesde", filtros.fechaDesde);
    if (filtros?.fechaHasta) params.append("fechaHasta", filtros.fechaHasta);
    if (filtros?.compararCon !== undefined)
      params.append("compararCon", String(filtros.compararCon));
    if (filtros?.vista) params.append("vista", filtros.vista);

    const query = params.toString();
    return apiClient.get<ReporteReservasResponseDto>(
      `/reportes/reservas${query ? `?${query}` : ""}`
    );
  },

  async getReporteComisiones(filtros?: {
    fechaDesde?: string;
    fechaHasta?: string;
    especialistaId?: number;
  }): Promise<ReporteComisionesResponseDto> {
    const params = new URLSearchParams();
    if (filtros?.fechaDesde) params.append("fechaDesde", filtros.fechaDesde);
    if (filtros?.fechaHasta) params.append("fechaHasta", filtros.fechaHasta);
    if (filtros?.especialistaId)
      params.append("especialistaId", String(filtros.especialistaId));

    const query = params.toString();
    return apiClient.get<ReporteComisionesResponseDto>(
      `/reportes/comisiones${query ? `?${query}` : ""}`
    );
  },
};
