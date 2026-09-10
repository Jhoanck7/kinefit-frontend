import { useMutation, useQuery } from "@tanstack/react-query";

import { CambiarPasswordRequest } from "@/models/requests";
import { authService } from "@/services";

export const useAuthenticateWithGoogleMutation = () => {
  return useMutation({
    mutationFn: ({
      idToken,
      consentimientoAceptado,
    }: {
      idToken: string;
      consentimientoAceptado: boolean;
    }) =>
      authService
        .loginWithGoogleToken(idToken, consentimientoAceptado)
        .then(res => res.data),
  });
};

export const useGetMiPerfil = () => {
  return useQuery({
    queryKey: ["mi-perfil"],
    queryFn: () => authService.getMiPerfil().then(res => res.data.data),
  });
};

export const useCambiarPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: CambiarPasswordRequest) =>
      authService.cambiarPasswordPersonal(data).then(res => res.data),
  });
};
