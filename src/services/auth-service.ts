import { ApiResponse } from "@/models/generics";
import {
  CambiarPasswordRequest,
  LoginPersonalRequest,
  UpdatePerfilRequest,
} from "@/models/requests";
import { PersonalLoginResponse } from "@/models/responses";
import { AuthGoogleResponse } from "@/types";

import { BaseApiService } from "./base-api-service";

export class AuthService extends BaseApiService {
  constructor() {
    super("/auth");
  }

  loginPersonal(data: LoginPersonalRequest) {
    return this.httpClient.post<ApiResponse<PersonalLoginResponse>>(
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

  loginWithGoogleToken(idToken: string) {
    return this.httpClient.post<AuthGoogleResponse>(`${this.baseURL}/google`, {
      idToken,
    });
  }

  updatePerfil(data: UpdatePerfilRequest, token: string) {
    return this.httpClient.patch<ApiResponse<{ message: string }>>(
      `${this.baseURL}/perfil`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }
}

export const authService = new AuthService();
