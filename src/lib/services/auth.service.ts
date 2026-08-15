import { apiClient } from "@/lib/api/apiClient";
import { AuthGoogleResponse } from "@/types";

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
    rol: "Administrador" | "Especialista" | "Personal";
    especialistaId?: number;
  };
}

interface GenericAuthResponse {
  data?: PersonalLoginResponseDto;
  token?: string;
  usuario?: PersonalLoginResponseDto["usuario"];
  message?: string;
}

export const authService = {
  async loginPersonal(
    dto: PersonalLoginRequestDto
  ): Promise<PersonalLoginResponseDto> {
    const raw = await apiClient.post<GenericAuthResponse>(
      "/auth/personal",
      dto
    );
    return raw?.data || (raw as unknown as PersonalLoginResponseDto);
  },

  async cambiarPasswordPersonal(
    passwordActual: string,
    nuevaPassword: string
  ): Promise<void> {
    return apiClient.patch<void>("/auth/personal/password", {
      passwordActual,
      nuevaPassword,
    });
  },

  async loginWithGoogleToken(idToken: string): Promise<AuthGoogleResponse> {
    return apiClient.post<AuthGoogleResponse>("/auth/google", { idToken });
  },

  async updatePerfil(
    rut: string,
    telefono: string,
    token: string
  ): Promise<{ message: string }> {
    return apiClient.patch<{ message: string }>(
      "/auth/perfil",
      { rut, telefono },
      undefined,
      token
    );
  },
};
