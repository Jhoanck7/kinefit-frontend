import {
  ConfirmarTransaccionResponseData,
  IniciarTransaccionResponseData,
} from "@/types";

import { BaseApiService } from "./base-api-service";

export class TransaccionService extends BaseApiService {
  constructor() {
    super("/transacciones");
  }

  iniciarTransaccion(citaId: number, token: string) {
    return this.httpClient.post<{
      data: IniciarTransaccionResponseData;
      message: string;
    }>(
      `${this.baseURL}/iniciar`,
      { citaId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  confirmarTransaccion(tokenWs: string) {
    return this.httpClient.post<{
      data: ConfirmarTransaccionResponseData;
      message: string;
    }>(`${this.baseURL}/confirmar`, { tokenWs });
  }
}

export const transaccionService = new TransaccionService();
