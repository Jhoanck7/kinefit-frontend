import { apiClient } from "@/lib/api/apiClient";

export interface ImageUploadResponse {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
}

export const mediaService = {
  async uploadImage(
    file: File,
    folder: string = "kinefit"
  ): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<{ data: ImageUploadResponse }>(
      `/media/upload?folder=${encodeURIComponent(folder)}`,
      formData
    );
    return response.data;
  },

  async replaceImage(
    publicId: string,
    file: File,
    folder: string = "kinefit"
  ): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.put<{ data: ImageUploadResponse }>(
      `/media/${encodeURIComponent(publicId)}?folder=${encodeURIComponent(folder)}`,
      formData
    );
    return response.data;
  },

  async deleteImage(publicId: string): Promise<boolean> {
    const response = await apiClient.delete<{ data: boolean }>(
      `/media/${encodeURIComponent(publicId)}`
    );
    return response.data;
  },
};
