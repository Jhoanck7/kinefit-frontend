import { ApiResponse } from "@/models/generics";
import { ImageUploadResponse } from "@/models/responses";

import { BaseApiService } from "./base-api-service";

// Tipo de respuesta del FileController (IFileService / ImagenSubidaResult)
interface ImagenSubidaResult {
  publicId: string;
  url: string;
  ancho: number;
  alto: number;
}

export class MediaService extends BaseApiService {
  constructor() {
    // Apunta al FileController (autenticado con Bearer token desde axiosInstance)
    super("/archivos/imagenes");
  }

  uploadImage(file: File, folder = "contenido") {
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
