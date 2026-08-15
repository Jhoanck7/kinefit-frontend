import { ApiResponse } from "@/models/generics";
import { ImageUploadResponse } from "@/models/responses";

import { BaseApiService } from "./base-api-service";

export class MediaService extends BaseApiService {
  constructor() {
    super("/media");
  }

  uploadImage(file: File, folder = "kinefit") {
    const formData = new FormData();
    formData.append("file", file);
    return this.httpClient.post<ApiResponse<ImageUploadResponse>>(
      `${this.baseURL}/upload?folder=${encodeURIComponent(folder)}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  }

  replaceImage(publicId: string, file: File, folder = "kinefit") {
    const formData = new FormData();
    formData.append("file", file);
    return this.httpClient.put<ApiResponse<ImageUploadResponse>>(
      `${this.baseURL}/${encodeURIComponent(publicId)}?folder=${encodeURIComponent(folder)}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  }

  deleteImage(publicId: string) {
    return this.httpClient.delete<ApiResponse<boolean>>(
      `${this.baseURL}/${encodeURIComponent(publicId)}`
    );
  }
}

export const mediaService = new MediaService();
