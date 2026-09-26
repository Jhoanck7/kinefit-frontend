import { useMutation, useQuery } from "@tanstack/react-query";

import { authService } from "@/services";

export const useAuthenticateWithGoogleMutation = () => {
  return useMutation({
    mutationFn: ({
      idToken,
      consentimientoAceptado,
      rut,
    }: {
      idToken: string;
      consentimientoAceptado: boolean;
      rut?: string;
    }) =>
      authService
        .loginWithGoogleToken(idToken, consentimientoAceptado, rut)
        .then(res => res.data),
  });
};

export const useGetMiPerfil = () => {
  return useQuery({
    queryKey: ["mi-perfil"],
    queryFn: () => authService.getMiPerfil().then(res => res.data.data),
  });
};
