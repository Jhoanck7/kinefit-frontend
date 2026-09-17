import { ApiResponse } from "@/models/generics";
import {
  CambiarPasswordRequest,
  LoginPersonalRequest,
  UpdatePerfilRequest,
} from "@/models/requests";
import { MiPerfilResponse, PersonalLoginResponse } from "@/models/responses";
import { axiosInstanceSinSesion } from "@/providers";
import { AuthGoogleResponse } from "@/types";

import { BaseApiService } from "./base-api-service";

export class AuthService extends BaseApiService {
  constructor() {
    super("/auth");
  }

  loginPersonal(data: LoginPersonalRequest) {
    return axiosInstanceSinSesion.post<ApiResponse<PersonalLoginResponse>>(
      `${this.baseURL}/personal`,
      data
    );
  }

  cambiarPasswordPersonal(data: CambiarPasswordRequest) {
    return this.httpClient.patch<ApiResponse<void>>(
      `${this.baseURL}/personal/password`,
      data
    );
  }

  loginWithGoogleToken(idToken: string, consentimientoAceptado: boolean) {
    return axiosInstanceSinSesion.post<AuthGoogleResponse>(
      `${this.baseURL}/google`,
      { idToken, consentimientoAceptado }
    );
  }

  updatePerfil(data: UpdatePerfilRequest, token: string) {
    return this.httpClient.patch<ApiResponse<{ message: string }>>(
      `${this.baseURL}/perfil`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  getMiPerfil() {
    return this.httpClient.get<ApiResponse<MiPerfilResponse>>(
      `${this.baseURL}/personal/me`
    );
  }
}

export const authService = new AuthService();
