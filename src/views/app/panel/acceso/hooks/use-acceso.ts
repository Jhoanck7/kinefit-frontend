"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

import { handleApiError } from "@/lib/api";
import { authService } from "@/services";

export const useAcceso = () => {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // La redirección si ya hay sesión la maneja proxy.ts en el servidor.

  async function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrorMsg(null);
    setCargando(true);

    const formData = new FormData(evento.currentTarget);
    const correo = (formData.get("correo") as string)?.trim();
    const contrasena = (formData.get("contrasena") as string)?.trim();

    try {
      const respuesta = await authService.loginPersonal({
        email: correo,
        password: contrasena,
      });
      const res = respuesta.data.data;

      if (res?.usuario && res?.token) {
        const sesion = await signIn("credentials", {
          email: res.usuario.email,
          token: res.token,
          redirect: false,
        });

        if (sesion?.error) {
          setErrorMsg(
            "No se pudo establecer la sesión del panel. Intenta nuevamente."
          );
          return;
        }

        router.push("/panel/agenda");
        return;
      } else {
        setErrorMsg(
          "Credenciales incorrectas o usuario no encontrado en la base de datos."
        );
      }
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    } finally {
      setCargando(false);
    }
  }

  return {
    cargando,
    errorMsg,
    actions: {
      alEnviar,
    },
  };
};
