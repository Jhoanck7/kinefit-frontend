/** Resultado de subir una imagen al servicio de almacenamiento */
export interface ImageUploadResponse {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
}
