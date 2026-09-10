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

  const handleFirmar = async (documentoFirmadoBase64: string) => {
    if (!data) return;
    await firmarPublico.mutateAsync({
      token,
      data: {
        huellaMostrada: data.huellaMostrada,
        documentoFirmadoBase64,
        contenido: data.tieneArchivo ? undefined : contenido,
      },
    });
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
