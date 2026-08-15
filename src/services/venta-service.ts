import { ApiResponse } from "@/models/generics";
import {
  CreateRepartoProfesionalRequest,
  CreateTasaImpuestoRequest,
  CreateTerminalPagoRequest,
  CreateVentaRequest,
} from "@/models/requests";
import {
  RepartoProfesionalResponse,
  TasaImpuestoResponse,
  TerminalPagoResponse,
  VentaResponse,
  VentasPaginadasResponse,
} from "@/models/responses";

import { BaseApiService } from "./base-api-service";

export interface FiltrosVentas {
  fechaDesde?: string;
  fechaHasta?: string;
  pacienteId?: number;
  metodoPago?: string;
  page?: number;
  pageSize?: number;
}

export class VentaService extends BaseApiService {
  constructor() {
    super("");
  }

  getAll(filtros?: FiltrosVentas) {
    return this.httpClient.get<ApiResponse<VentasPaginadasResponse>>(
      `${this.baseURL}/ventas`,
      { params: filtros }
    );
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<VentaResponse>>(
      `${this.baseURL}/ventas/${id}`
    );
  }

  create(data: CreateVentaRequest) {
    return this.httpClient.post<ApiResponse<VentaResponse>>(
      `${this.baseURL}/ventas`,
      data
    );
  }

  getTerminales() {
    return this.httpClient.get<ApiResponse<TerminalPagoResponse[]>>(
      `${this.baseURL}/terminales`
    );
  }

  createTerminal(data: CreateTerminalPagoRequest) {
    return this.httpClient.post<ApiResponse<TerminalPagoResponse>>(
      `${this.baseURL}/terminales`,
      data
    );
  }

  getRepartos() {
    return this.httpClient.get<ApiResponse<RepartoProfesionalResponse[]>>(
      `${this.baseURL}/reportes/repartos`
    );
  }

  createReparto(data: CreateRepartoProfesionalRequest) {
    return this.httpClient.post<ApiResponse<RepartoProfesionalResponse>>(
      `${this.baseURL}/reportes/repartos`,
      data
    );
  }

  getTasasImpuesto() {
    return this.httpClient.get<ApiResponse<TasaImpuestoResponse[]>>(
      `${this.baseURL}/reportes/tasa-impuesto`
    );
  }

  createTasaImpuesto(data: CreateTasaImpuestoRequest) {
    return this.httpClient.post<ApiResponse<TasaImpuestoResponse>>(
      `${this.baseURL}/reportes/tasa-impuesto`,
      data
    );
  }
}

export const ventaService = new VentaService();
