import { useMutation } from "@tanstack/react-query";

import { mediaService } from "@/services";

/** Sube una imagen al servicio de medios */
export const useUploadImageMutation = () => {
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      mediaService.uploadImage(file, folder).then(res => res.data.data),
  });
};

/** Reemplaza una imagen existente en el servicio de medios */
export const useReplaceImageMutation = () => {
  return useMutation({
    mutationFn: ({
      publicId,
      file,
      folder,
    }: {
      publicId: string;
      file: File;
      folder?: string;
    }) =>
      mediaService
        .replaceImage(publicId, file, folder)
        .then(res => res.data.data),
  });
};

/** Elimina una imagen del servicio de medios */
export const useDeleteImageMutation = () => {
  return useMutation({
    mutationFn: (publicId: string) =>
      mediaService.deleteImage(publicId).then(res => res.data.data),
  });
};
