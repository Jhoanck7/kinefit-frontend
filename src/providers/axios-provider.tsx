import axios from "axios";
import { getSession, signOut } from "next-auth/react";

import { isSessionExpired } from "@/lib/auth";

// El backend autentica con Authorization: Bearer, no con cookies.
export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(async config => {
  const yaTieneAuthorization = Boolean(
    (config.headers as Record<string, string> | undefined)?.["Authorization"]
  );

  // El token explícito del paciente (flujo público) siempre gana sobre la sesión del panel.
  if (typeof window !== "undefined" && !yaTieneAuthorization) {
    const session = await getSession();
    const token = session?.accessToken;

    if (session && isSessionExpired(session)) {
      // TODO: reemplazar por toast cuando se instale un sistema de notificaciones
      console.error(
        "Tu sesión ha expirado. Por favor, inicia sesión de nuevo."
      );
      await signOut({ redirect: false });
      return Promise.reject(new Error("Token expired"));
    }

    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>)["Authorization"] =
        `Bearer ${token}`;
    }
  }

  return config;
});
