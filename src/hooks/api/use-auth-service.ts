import { useMutation, useQuery } from "@tanstack/react-query";

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
