import { ApiResponse } from "@/models/generics";
import { UpdateContenidoRequest } from "@/models/requests";
import { ContenidoSitioResponse } from "@/models/responses";
import { axiosInstanceSinSesion } from "@/providers";

import { BaseApiService } from "./base-api-service";

/** Consume los endpoints del contenido institucional del sitio público */
export class ContenidoService extends BaseApiService {
  constructor() {
    super("/contenido");
  }

  getAll() {
    return axiosInstanceSinSesion.get<ApiResponse<ContenidoSitioResponse[]>>(
      this.baseURL
    );
  }

  update(clave: string, data: UpdateContenidoRequest) {
    return this.httpClient.put<ApiResponse<ContenidoSitioResponse>>(
      `${this.baseURL}/${clave}`,
      data
    );
  }
}

export const contenidoService = new ContenidoService();
