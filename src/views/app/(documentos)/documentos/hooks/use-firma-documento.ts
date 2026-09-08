"use client";

import { useState } from "react";

import {
  useFirmarDocumentoPublicoMutation,
  useGetDocumentoPublico,
} from "@/hooks/api";

interface UseFirmaDocumentoParams {
  token: string;
}

export function useFirmaDocumento({ token }: UseFirmaDocumentoParams) {
  const { data, isLoading, error } = useGetDocumentoPublico(token);
  const firmarPublico = useFirmarDocumentoPublicoMutation();

  const [contenido, setContenido] = useState<Record<string, string>>({});
  const [firmado, setFirmado] = useState(false);

  const handleCambiarCampo = (campoId: string, valor: string) => {
    setContenido(prev => ({ ...prev, [campoId]: valor }));
  };

  const archivoUrl = data?.tieneArchivo
    ? `${process.env.NEXT_PUBLIC_API_URL}/documentos/publico/${token}/archivo`
    : null;

  const handleFirmar = async (firmaBase64: string) => {
    if (!data) return;
    const payload = {
      contenido,
      firmaPacienteBase64: firmaBase64,
      huellaMostrada: data.huellaMostrada,
    };

    await firmarPublico.mutateAsync({ token, data: payload });
    setFirmado(true);
  };

  return {
    data,
    isLoading,
    error,
    archivoUrl,
    contenido,
    handleCambiarCampo,
    handleFirmar,
    guardando: firmarPublico.isPending,
    errorFirma: firmarPublico.error,
    firmado,
  };
}
