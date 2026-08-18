import { ApiResponse } from "@/models/generics";
import {
  ReporteComisionesResponse,
  ReporteReservasResponse,
  ReporteVentasResponse,
} from "@/models/responses";

import { BaseApiService } from "./base-api-service";

export interface FiltrosReporteVentas {
  fechaDesde?: string;
  fechaHasta?: string;
  clienteId?: number;
  metodoPago?: string;
  page?: number;
  pageSize?: number;
}

export interface FiltrosReporteReservas {
  fechaDesde?: string;
  fechaHasta?: string;
  compararCon?: boolean;
  vista?: string;
}

export interface FiltrosReporteComisiones {
  fechaDesde?: string;
  fechaHasta?: string;
  especialistaId?: number;
}

export class ReporteService extends BaseApiService {
  constructor() {
    super("/reportes");
  }

  getReporteVentas(filtros?: FiltrosReporteVentas) {
    return this.httpClient.get<ApiResponse<ReporteVentasResponse>>(
      `${this.baseURL}/ventas`,
      { params: filtros }
    );
  }

  descargarReporteVentasCsv(
    filtros?: Omit<FiltrosReporteVentas, "page" | "pageSize">
  ) {
    return this.httpClient.get<Blob>(`${this.baseURL}/ventas`, {
      params: { ...filtros, formato: "csv" },
      responseType: "blob",
    });
  }

  getReporteReservas(filtros?: FiltrosReporteReservas) {
    return this.httpClient.get<ApiResponse<ReporteReservasResponse>>(
      `${this.baseURL}/reservas`,
      { params: filtros }
    );
  }

  getReporteComisiones(filtros?: FiltrosReporteComisiones) {
    return this.httpClient.get<ApiResponse<ReporteComisionesResponse>>(
      `${this.baseURL}/comisiones`,
      { params: filtros }
    );
  }
}

export const reporteService = new ReporteService();
