import { apiClient } from '@/lib/api/apiClient';

export interface PersonalLoginRequestDto {
  email: string;
  password: string;
}

export interface PersonalLoginResponseDto {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: 'Administrador' | 'Especialista' | 'Personal';
    especialistaId?: number;
  };
}

interface GenericAuthResponse {
  data?: PersonalLoginResponseDto;
  token?: string;
  usuario?: PersonalLoginResponseDto['usuario'];
  message?: string;
}

export const authService = {
  async loginPersonal(dto: PersonalLoginRequestDto): Promise<PersonalLoginResponseDto> {
    const raw = await apiClient.post<GenericAuthResponse>('/auth/personal', dto);
    const data = raw?.data || (raw as unknown as PersonalLoginResponseDto);

    if (data?.token && typeof window !== 'undefined') {
      localStorage.setItem('kinefit_token', data.token);
      localStorage.setItem('kinefit_user', JSON.stringify(data.usuario));
    }
    return data;
  },

  async cambiarPasswordPersonal(passwordActual: string, nuevaPassword: string): Promise<void> {
    return apiClient.patch<void>('/auth/personal/password', {
      passwordActual,
      nuevaPassword,
    });
  },

  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('kinefit_token');
  },

  logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('kinefit_token');
    localStorage.removeItem('kinefit_user');
  },
};
