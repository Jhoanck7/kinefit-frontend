import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { GuardarFirmaRequest } from "@/models/requests";
import { authService } from "@/services";

export const useAuthenticateWithGoogleMutation = () => {
  return useMutation({
    mutationFn: (idToken: string) =>
      authService.loginWithGoogleToken(idToken).then(res => res.data),
  });
};

export const useGetMiPerfil = () => {
  return useQuery({
    queryKey: ["mi-perfil"],
    queryFn: () => authService.getMiPerfil().then(res => res.data.data),
  });
};

export const useGuardarFirmaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GuardarFirmaRequest) =>
      authService.guardarMiFirma(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mi-perfil"] });
    },
  });
};
