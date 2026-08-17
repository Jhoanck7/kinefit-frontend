import { useMutation } from "@tanstack/react-query";

import { authService } from "@/services";

export const useAuthenticateWithGoogleMutation = () => {
  return useMutation({
    mutationFn: (idToken: string) =>
      authService.loginWithGoogleToken(idToken).then(res => res.data),
  });
};
