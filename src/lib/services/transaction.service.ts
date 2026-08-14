import { apiClient } from "@/lib/api/apiClient";
import {
  ConfirmarTransaccionResponseData,
  IniciarTransaccionResponseData,
} from "@/types";

export const transactionService = {
  async iniciarTransaccion(
    citaId: number,
    token: string
  ): Promise<{ data: IniciarTransaccionResponseData; message: string }> {
    return apiClient.post<{
      data: IniciarTransaccionResponseData;
      message: string;
    }>("/transacciones/iniciar", { citaId }, undefined, token);
  },

  async confirmarTransaccion(
    tokenWs: string
  ): Promise<{ data: ConfirmarTransaccionResponseData; message: string }> {
    return apiClient.post<{
      data: ConfirmarTransaccionResponseData;
      message: string;
    }>("/transacciones/confirmar", { tokenWs });
  },
};
