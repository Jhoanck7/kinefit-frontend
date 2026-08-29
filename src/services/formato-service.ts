import { ApiResponse } from "@/models/generics";
import {
  CreateFormatoFichaRequest,
  UpdateFormatoFichaRequest,
} from "@/models/requests";
import { FormatoFichaResponse } from "@/models/responses";

import { BaseApiService } from "./base-api-service";

export class FormatoService extends BaseApiService {
  constructor() {
    super("/formatos");
  }

  getAll(soloActivos = true) {
    return this.httpClient.get<ApiResponse<FormatoFichaResponse[]>>(
      this.baseURL,
      { params: { soloActivos } }
    );
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<FormatoFichaResponse>>(
      `${this.baseURL}/${id}`
    );
  }

  create(data: CreateFormatoFichaRequest) {
    return this.httpClient.post<ApiResponse<FormatoFichaResponse>>(
      this.baseURL,
      data
    );
  }

  /** Con fichas ya creadas, el servidor rechaza salvo que confirmar sea true. */
  update(id: number, data: UpdateFormatoFichaRequest, confirmar = false) {
    return this.httpClient.put<ApiResponse<FormatoFichaResponse>>(
      `${this.baseURL}/${id}`,
      data,
      { params: { confirmar } }
    );
  }

  updateEstado(id: number, activo: boolean) {
    return this.httpClient.patch<ApiResponse<FormatoFichaResponse>>(
      `${this.baseURL}/${id}/estado`,
      { activo }
    );
  }

  importar(archivo: File, nombre: string, tipo: string) {
    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("nombre", nombre);
    formData.append("tipo", tipo);
    return this.httpClient.post<ApiResponse<FormatoFichaResponse>>(
      `${this.baseURL}/importar`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  }
}

export const formatoService = new FormatoService();
