import { apiClient } from '@/lib/api/apiClient';
import { AuthGoogleResponse } from '@/types';

export const authService = {
  async loginWithGoogleToken(idToken: string): Promise<AuthGoogleResponse> {
    return apiClient.post<AuthGoogleResponse>('/auth/google', { idToken });
  },

  async updatePerfil(rut: string, telefono: string, token: string): Promise<{ message: string }> {
    return apiClient.patch<{ message: string }>('/auth/perfil', { rut, telefono }, undefined, token);
  }
};
