import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { UpdateLandingConfigRequest } from "@/models/requests";
import { landingConfigService } from "@/services";

/** Obtiene la configuración de la landing pública */
export const useGetLandingConfig = (enabled = true) => {
  return useQuery({
    queryKey: ["landing-config"],
    queryFn: async () => {
      const res = await landingConfigService.getConfig();
      return res.data.data;
    },
    enabled,
  });
};

/** Actualiza la configuración de la landing pública */
export const useUpdateLandingConfigMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateLandingConfigRequest) =>
      landingConfigService.updateConfig(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-config"] });
    },
  });
};

/** Sincroniza las reseñas de Google mostradas en la landing */
export const useSincronizarGoogleReviewsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (limite: number = 5) =>
      landingConfigService
        .sincronizarGoogleReviews(limite)
        .then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-config"] });
    },
  });
};
