import { axiosInstanceSinSesion } from "@/providers";
import {
  ConfirmarTransaccionResponseData,
  IniciarTransaccionResponseData,
} from "@/types";

import { BaseApiService } from "./base-api-service";

/** Consume los endpoints de la pasarela de pago para reservas del sitio público */
export class TransaccionService extends BaseApiService {
  constructor() {
    super("/transacciones", axiosInstanceSinSesion);
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

  anularTransaccion(tokenWs: string, buyOrder?: string | null) {
    return this.httpClient.post<{ message: string }>(`${this.baseURL}/anular`, {
      tokenWs,
      buyOrder: buyOrder ?? undefined,
    });
  }
}

export const transaccionService = new TransaccionService();
