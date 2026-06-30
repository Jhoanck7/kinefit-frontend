import { apiClient } from '../api/apiClient';
import { AuthResponse } from '@/types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    // Le pega al endpoint de tu backend .NET Core (ej: AuthController.cs)
    return apiClient.post<AuthResponse>('/auth/login', { email, password });
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', { name, email, password });
  }
};