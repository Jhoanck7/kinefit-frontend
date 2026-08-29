"use client";

import { useEffect, useState } from "react";

import {
  useFirmarDocumentoPropioMutation,
  useFirmarDocumentoPublicoMutation,
  useGetDocumentoPropio,
  useGetDocumentoPublico,
} from "@/hooks/api";
import { documentoService } from "@/services";

interface UseFirmaDocumentoParams {
  token?: string;
  documentoId?: number;
}

export function useFirmaDocumento({
  token,
  documentoId,
}: UseFirmaDocumentoParams) {
  const esPropio = documentoId !== undefined;

  const publico = useGetDocumentoPublico(esPropio ? null : (token ?? null));
  const propio = useGetDocumentoPropio(esPropio ? (documentoId ?? null) : null);

  const data = esPropio ? propio.data : publico.data;
  const isLoading = esPropio ? propio.isLoading : publico.isLoading;
  const error = esPropio ? propio.error : publico.error;

  const firmarPublico = useFirmarDocumentoPublicoMutation();
  const firmarPropio = useFirmarDocumentoPropioMutation();

  const [contenido, setContenido] = useState<Record<string, string>>({});
  const [firmado, setFirmado] = useState(false);
  const [archivoObjectUrl, setArchivoObjectUrl] = useState<string | null>(null);

  const handleCambiarCampo = (campoId: string, valor: string) => {
    setContenido(prev => ({ ...prev, [campoId]: valor }));
  };

  // el archivo público es una URL directa; el propio exige el Bearer, así que se trae como blob
  useEffect(() => {
    if (!esPropio || !documentoId || !data?.tieneArchivo) return;

    let objectUrl: string | null = null;
    let cancelado = false;
    documentoService.getArchivoPropio(documentoId).then(res => {
      if (cancelado) return;
      objectUrl = URL.createObjectURL(res.data as Blob);
      setArchivoObjectUrl(objectUrl);
    });
    return () => {
      cancelado = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [esPropio, documentoId, data?.tieneArchivo]);

  const archivoUrl =
    !esPropio && token && data?.tieneArchivo
      ? `${process.env.NEXT_PUBLIC_API_URL}/documentos/publico/${token}/archivo`
      : archivoObjectUrl;

  const handleFirmar = async (firmaBase64: string) => {
    if (!data) return;
    const payload = {
      contenido,
      firmaPacienteBase64: firmaBase64,
      huellaMostrada: data.huellaMostrada,
    };

    if (esPropio && documentoId) {
      await firmarPropio.mutateAsync({ id: documentoId, data: payload });
    } else if (token) {
      await firmarPublico.mutateAsync({ token, data: payload });
    }
    setFirmado(true);
  };

  const guardando = esPropio ? firmarPropio.isPending : firmarPublico.isPending;
  const errorFirma = esPropio ? firmarPropio.error : firmarPublico.error;

  return {
    data,
    isLoading,
    error,
    archivoUrl,
    contenido,
    handleCambiarCampo,
    handleFirmar,
    guardando,
    errorFirma,
    firmado,
  };
}
