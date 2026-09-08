"use client";

import { signOut } from "next-auth/react";
import { FormEvent, useState } from "react";

import { useCambiarPasswordMutation } from "@/hooks/api";
import { handleApiError } from "@/lib/api";

export const useCambiarPassword = () => {
  const mutation = useCambiarPasswordMutation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrorMsg(null);

    const formData = new FormData(evento.currentTarget);
    const passwordActual = (formData.get("passwordActual") as string)?.trim();
    const passwordNueva = (formData.get("passwordNueva") as string)?.trim();
    const passwordConfirmacion = (
      formData.get("passwordConfirmacion") as string
    )?.trim();

    if (passwordNueva !== passwordConfirmacion) {
      setErrorMsg("Las contraseñas nuevas no coinciden");
      return;
    }

    try {
      await mutation.mutateAsync({ passwordActual, passwordNueva });
      await signOut({ callbackUrl: "/panel/acceso" });
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  }

  return {
    cargando: mutation.isPending,
    errorMsg,
    actions: {
      alEnviar,
    },
  };
};
