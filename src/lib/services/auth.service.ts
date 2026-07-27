import { apiClient } from '@/lib/api/apiClient';
import { AuthGoogleResponse } from '@/types';

export const authService = {
  async loginWithGoogleToken(idToken: string): Promise<AuthGoogleResponse> {
    return apiClient.post<AuthGoogleResponse>('/auth/google', { idToken });
  }
};
