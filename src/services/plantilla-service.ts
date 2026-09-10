import { ApiResponse } from "@/models/generics";
import {
  CreatePlantillaConsentimientoRequest,
  CreatePlantillaFichaRequest,
  CreatePlantillaRecomendacionRequest,
  UpdatePlantillaRequest,
} from "@/models/requests";
import { PlantillaResponse } from "@/models/responses";

import { BaseApiService } from "./base-api-service";

export class PlantillaService extends BaseApiService {
  constructor() {
    super("/documentos/plantillas");
  }

  getAll(soloActivos = true) {
    return this.httpClient.get<ApiResponse<PlantillaResponse[]>>(this.baseURL, {
      params: { soloActivos },
    });
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<PlantillaResponse>>(
      `${this.baseURL}/${id}`
    );
  }

  crearFicha(data: CreatePlantillaFichaRequest) {
    return this.httpClient.post<ApiResponse<PlantillaResponse>>(
      `${this.baseURL}/fichas`,
      data
    );
  }

  crearConsentimiento(data: CreatePlantillaConsentimientoRequest) {
    return this.httpClient.post<ApiResponse<PlantillaResponse>>(
      `${this.baseURL}/consentimientos`,
      data
    );
  }

  importarConsentimiento(
    archivo: File,
    nombre: string,
    requiereFirmaPaciente: boolean,
    requiereFirmaProfesional: boolean
  ) {
    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("nombre", nombre);
    formData.append("requiereFirmaPaciente", String(requiereFirmaPaciente));
    formData.append(
      "requiereFirmaProfesional",
      String(requiereFirmaProfesional)
    );
    return this.httpClient.post<ApiResponse<PlantillaResponse>>(
      `${this.baseURL}/consentimientos/importar`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  }

  crearRecomendacion(data: CreatePlantillaRecomendacionRequest) {
    return this.httpClient.post<ApiResponse<PlantillaResponse>>(
      `${this.baseURL}/recomendaciones`,
      data
    );
  }

  importarRecomendacion(archivo: File, nombre: string) {
    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("nombre", nombre);
    return this.httpClient.post<ApiResponse<PlantillaResponse>>(
      `${this.baseURL}/recomendaciones/importar`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  }

  /** Con documentos ya generados desde ella, el servidor rechaza salvo que confirmar sea true. */
  update(id: number, data: UpdatePlantillaRequest, confirmar = false) {
    return this.httpClient.put<ApiResponse<PlantillaResponse>>(
      `${this.baseURL}/${id}`,
      data,
      { params: { confirmar } }
    );
  }

  updateEstado(id: number, activo: boolean) {
    return this.httpClient.patch<ApiResponse<PlantillaResponse>>(
      `${this.baseURL}/${id}/estado`,
      { activo }
    );
  }

  abrirArchivo(id: number) {
    return this.httpClient.get<Blob>(`${this.baseURL}/${id}/archivo`, {
      responseType: "blob",
    });
  }
}

export const plantillaService = new PlantillaService();
