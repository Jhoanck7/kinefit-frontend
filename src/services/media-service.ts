import { MAX_IMAGEN_BYTES, validarTamano } from "@/lib/limites-archivo";
import { ApiResponse } from "@/models/generics";
import { ImageUploadResponse } from "@/models/responses";

import { BaseApiService } from "./base-api-service";

/** Resultado de subir o reemplazar una imagen en el backend */
interface ImagenSubidaResult {
  publicId: string;
  url: string;
  ancho: number;
  alto: number;
}

/** Consume los endpoints de subida, reemplazo y borrado de imágenes */
export class MediaService extends BaseApiService {
  constructor() {
    super("/archivos/imagenes");
  }

  uploadImage(file: File, folder = "contenido") {
    validarTamano(file, MAX_IMAGEN_BYTES);
    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("carpeta", folder);
    return this.httpClient.post<ApiResponse<ImagenSubidaResult>>(
      `${this.baseURL}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  }

  replaceImage(publicId: string, file: File, folder = "contenido") {
    validarTamano(file, MAX_IMAGEN_BYTES);
    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("carpeta", folder);
    return this.httpClient.put<ApiResponse<ImagenSubidaResult>>(
      `${this.baseURL}/${encodeURIComponent(publicId)}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  }

  deleteImage(publicId: string) {
    return this.httpClient.delete<ApiResponse<string>>(
      `${this.baseURL}/${encodeURIComponent(publicId)}`
    );
  }
}

export const mediaService = new MediaService();
