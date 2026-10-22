import { MAX_ADJUNTO_BYTES, validarTamano } from "@/lib/limites-archivo";
import { ApiResponse } from "@/models/generics";
import {
  CreateFichaRequest,
  EnviarRecomendacionRequest,
  FirmarDocumentoRequest,
  FirmarProfesionalRequest,
  RechazarDocumentoRequest,
  UpdateFichaRequest,
} from "@/models/requests";
import {
  AdjuntoResumenResponse,
  AuditoriaEventosPaginadasResponse,
  ConsentimientoCitaResponse,
  DocumentoDetalleResponse,
  DocumentoPublicoResponse,
  DocumentoResumenResponse,
  DocumentosPaginadosResponse,
  FichaDePacienteResponse,
  FichaResponse,
  RecomendacionResponse,
  ReenviarCorreoResponse,
} from "@/models/responses";
import { axiosInstanceSinSesion } from "@/providers";

import { BaseApiService } from "./base-api-service";

/** Filtros aceptados al listar documentos */
export interface FiltrosDocumentos {
  busqueda?: string;
  tipo?: string;
  estado?: string;
  especialistaId?: number;
  citaId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  pageSize?: number;
}

/** Consume los endpoints de fichas, consentimientos y recomendaciones del panel */
export class DocumentoService extends BaseApiService {
  constructor() {
    super("/documentos");
  }

  getAll(filtros?: FiltrosDocumentos) {
    return this.httpClient.get<ApiResponse<DocumentosPaginadosResponse>>(
      this.baseURL,
      { params: filtros }
    );
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<DocumentoDetalleResponse>>(
      `${this.baseURL}/${id}`
    );
  }

  // el endpoint exige el Bearer del panel, no sirve como URL directa, hay que traerlo como blob
  abrirArchivo(id: number) {
    return this.httpClient.get<Blob>(`${this.baseURL}/${id}/archivo`, {
      responseType: "blob",
    });
  }

  descargarArchivo(id: number) {
    return this.httpClient.get<Blob>(
      `${this.baseURL}/${id}/archivo/descargar`,
      {
        responseType: "blob",
      }
    );
  }

  getAuditoria(id: number, page = 1, pageSize = 20) {
    return this.httpClient.get<ApiResponse<AuditoriaEventosPaginadasResponse>>(
      `${this.baseURL}/${id}/auditoria`,
      { params: { page, pageSize } }
    );
  }

  crearFicha(data: CreateFichaRequest) {
    return this.httpClient.post<ApiResponse<FichaResponse>>(
      `${this.baseURL}/fichas`,
      data
    );
  }

  adjuntarFicha(citaId: number, archivo: File, nombre?: string) {
    validarTamano(archivo, MAX_ADJUNTO_BYTES);
    const formData = new FormData();
    formData.append("archivo", archivo);
    if (nombre) formData.append("nombre", nombre);
    return this.httpClient.post<ApiResponse<FichaResponse>>(
      `${this.baseURL}/fichas/cita/${citaId}/adjuntar`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  }

  actualizarFicha(id: number, data: UpdateFichaRequest) {
    return this.httpClient.put<ApiResponse<FichaResponse>>(
      `${this.baseURL}/fichas/${id}`,
      data
    );
  }

  cerrarFicha(id: number) {
    return this.httpClient.post<ApiResponse<FichaResponse>>(
      `${this.baseURL}/fichas/${id}/cerrar`
    );
  }

  getHistorialPorPaciente(pacienteId: number) {
    return this.httpClient.get<ApiResponse<DocumentoResumenResponse[]>>(
      `${this.baseURL}/pacientes/${pacienteId}/historial`
    );
  }

  getFichasPorPaciente(pacienteId: number) {
    return this.httpClient.get<ApiResponse<FichaDePacienteResponse[]>>(
      `${this.baseURL}/pacientes/${pacienteId}/fichas`
    );
  }

  // adjuntos, comunes a fichas, consentimientos y recomendaciones
  subirAdjunto(documentoId: number, archivo: File) {
    validarTamano(archivo, MAX_ADJUNTO_BYTES);
    const formData = new FormData();
    formData.append("archivo", archivo);
    return this.httpClient.post<ApiResponse<AdjuntoResumenResponse>>(
      `${this.baseURL}/${documentoId}/adjuntos`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  }

  eliminarAdjunto(adjuntoId: number) {
    return this.httpClient.delete<ApiResponse<null>>(
      `${this.baseURL}/adjuntos/${adjuntoId}`
    );
  }

  descargarAdjunto(adjuntoId: number) {
    return this.httpClient.get<Blob>(`${this.baseURL}/adjuntos/${adjuntoId}`, {
      responseType: "blob",
    });
  }

  enviarRecomendacion(citaId: number, data: EnviarRecomendacionRequest) {
    return this.httpClient.post<ApiResponse<RecomendacionResponse | null>>(
      `${this.baseURL}/recomendaciones/cita/${citaId}`,
      data
    );
  }

  adjuntarRecomendacion(citaId: number, archivo: File, nombre?: string) {
    validarTamano(archivo, MAX_ADJUNTO_BYTES);
    const formData = new FormData();
    formData.append("archivo", archivo);
    if (nombre) formData.append("nombre", nombre);
    return this.httpClient.post<ApiResponse<RecomendacionResponse | null>>(
      `${this.baseURL}/recomendaciones/cita/${citaId}/adjuntar`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  }

  // pestaña de documentos del detalle de la cita
  getPorCita(citaId: number) {
    return this.httpClient.get<ApiResponse<ConsentimientoCitaResponse[]>>(
      `${this.baseURL}/cita/${citaId}`
    );
  }

  firmarProfesional(id: number, data: FirmarProfesionalRequest) {
    return this.httpClient.post<ApiResponse<ConsentimientoCitaResponse>>(
      `${this.baseURL}/${id}/firma-profesional`,
      data
    );
  }

  subirEscaneo(id: number, archivo: File) {
    validarTamano(archivo, MAX_ADJUNTO_BYTES);
    const formData = new FormData();
    formData.append("archivo", archivo);
    return this.httpClient.post<ApiResponse<ConsentimientoCitaResponse>>(
      `${this.baseURL}/${id}/escaneo`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  }

  rechazar(id: number, data: RechazarDocumentoRequest) {
    return this.httpClient.post<ApiResponse<ConsentimientoCitaResponse>>(
      `${this.baseURL}/${id}/rechazar`,
      data
    );
  }

  reenviarToken(id: number) {
    return this.httpClient.post<ApiResponse<ReenviarCorreoResponse>>(
      `${this.baseURL}/${id}/reenviar-token`
    );
  }

  reenviarPorCorreo(id: number) {
    return this.httpClient.post<ApiResponse<ReenviarCorreoResponse>>(
      `${this.baseURL}/${id}/reenviar-correo`
    );
  }
}

/** Consume los endpoints públicos de documentos, sin el Bearer del panel, para que el paciente los lea y firme */
export class DocumentoPublicoService extends BaseApiService {
  constructor() {
    super("/documentos/publico", axiosInstanceSinSesion);
  }

  getPublico(token: string) {
    return this.httpClient.get<ApiResponse<DocumentoPublicoResponse>>(
      `${this.baseURL}/${token}`
    );
  }

  archivoUrl(token: string) {
    return `${this.httpClient.defaults.baseURL}${this.baseURL}/${token}/archivo`;
  }

  firmarPublico(token: string, data: FirmarDocumentoRequest) {
    return this.httpClient.post<ApiResponse<ConsentimientoCitaResponse>>(
      `${this.baseURL}/${token}/firmar`,
      data
    );
  }
}

export const documentoService = new DocumentoService();
export const documentoPublicoService = new DocumentoPublicoService();
