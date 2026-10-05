import { useMutation, useQuery } from "@tanstack/react-query";

import { authService } from "@/services";

/** Autentica a un usuario con Google, enviando su RUT cuando corresponde vincular la ficha existente */
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

/** Obtiene el perfil del usuario autenticado */
export const useGetMiPerfil = () => {
  return useQuery({
    queryKey: ["mi-perfil"],
    queryFn: () => authService.getMiPerfil().then(res => res.data.data),
  });
};
