import { ApiResponse } from "@/models/generics";
import { FirmarDocumentoRequest } from "@/models/requests";
import {
  DocumentoPacienteResponse,
  DocumentoPublicoResponse,
} from "@/models/responses";
import { axiosInstanceSinSesion } from "@/providers";

import { BaseApiService } from "./base-api-service";

export class DocumentoService extends BaseApiService {
  constructor() {
    super("/documentos");
  }

  getMisPendientes(citaId: number) {
    return this.httpClient.get<ApiResponse<DocumentoPacienteResponse[]>>(
      `${this.baseURL}/mis-pendientes/${citaId}`
    );
  }

  getPropio(id: number) {
    return this.httpClient.get<ApiResponse<DocumentoPublicoResponse>>(
      `${this.baseURL}/propio/${id}`
    );
  }

  firmarPropio(id: number, data: FirmarDocumentoRequest) {
    return this.httpClient.post<ApiResponse<DocumentoPacienteResponse>>(
      `${this.baseURL}/propio/${id}/firmar`,
      data
    );
  }

  getArchivoPropio(id: number) {
    return this.httpClient.get(`${this.baseURL}/propio/${id}/archivo`, {
      responseType: "blob",
    });
  }

  getPorCita(citaId: number) {
    return this.httpClient.get<ApiResponse<DocumentoPacienteResponse[]>>(
      `${this.baseURL}/cita/${citaId}`
    );
  }

  firmarProfesional(id: number) {
    return this.httpClient.post<ApiResponse<DocumentoPacienteResponse>>(
      `${this.baseURL}/${id}/firma-profesional`
    );
  }

  subirEscaneo(id: number, archivo: File) {
    const formData = new FormData();
    formData.append("archivo", archivo);
    return this.httpClient.post<ApiResponse<DocumentoPacienteResponse>>(
      `${this.baseURL}/${id}/escaneo`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  }

  reemitirToken(id: number) {
    return this.httpClient.post<ApiResponse<{ url: string; expiraEn: string }>>(
      `${this.baseURL}/${id}/reemitir-token`
    );
  }

  getPendientes() {
    return this.httpClient.get<
      ApiResponse<{
        total: number;
        items: {
          documentoId: number;
          citaId: number;
          paciente: string;
          nombreFormato: string;
          fecha: string;
        }[];
      }>
    >(`${this.baseURL}/pendientes`);
  }
}

/** Sin sesión: usa axiosInstanceSinSesion para no adjuntar el Bearer del panel */
export class DocumentoPublicoService extends BaseApiService {
  constructor() {
    super("/documentos/publico", axiosInstanceSinSesion);
  }

  getPublico(token: string) {
    return this.httpClient.get<ApiResponse<DocumentoPublicoResponse>>(
      `${this.baseURL}/${token}`
    );
  }

  firmarPublico(token: string, data: FirmarDocumentoRequest) {
    return this.httpClient.post<ApiResponse<DocumentoPacienteResponse>>(
      `${this.baseURL}/${token}/firmar`,
      data
    );
  }
}

export const documentoService = new DocumentoService();
export const documentoPublicoService = new DocumentoPublicoService();
