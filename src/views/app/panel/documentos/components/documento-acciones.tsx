"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

import { Alerta } from "@/components/shared";
import {
  useAbrirArchivoDocumentoMutation,
  useFirmarProfesionalMutation,
  useReenviarPorCorreoMutation,
  useReenviarTokenMutation,
  useSubirEscaneoMutation,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import PdfSignatureCanvas from "@/views/app/(documentos)/documentos/components/pdf-signature-canvas";

export interface DocumentoAccionable {
  id: number;
  estado: string;
  tieneArchivo: boolean;
  requiereFirmaProfesional: boolean;
  firmaPacienteLista: boolean;
  firmaProfesionalLista: boolean;
}

const ESTILO_ACCION =
  "font-sans text-xs font-bold text-muted-foreground hover:text-foreground disabled:opacity-50";

export function DocumentoAcciones({
  documento,
  encabezado,
  permitirFirma = true,
  onCambio,
}: {
  documento: DocumentoAccionable;
  encabezado?: ReactNode;
  permitirFirma?: boolean;
  onCambio?: () => void;
}) {
  const firmarProfesional = useFirmarProfesionalMutation();
  const subirEscaneo = useSubirEscaneoMutation();
  const reenviarToken = useReenviarTokenMutation();
  const reenviarPorCorreo = useReenviarPorCorreoMutation();
  const abrirArchivo = useAbrirArchivoDocumentoMutation();

  const [enlaceCopiado, setEnlaceCopiado] = useState(false);
  const [correoEnviado, setCorreoEnviado] = useState(false);
  const [visorUrl, setVisorUrl] = useState<string | null>(null);
  const [visorEsImagen, setVisorEsImagen] = useState(false);
  const [firmaUrl, setFirmaUrl] = useState<string | null>(null);
  const [firmaVacia, setFirmaVacia] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pdfFirmaRef =
    useRef<React.ComponentRef<typeof PdfSignatureCanvas>>(null);
  const urlDescargada = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (urlDescargada.current) URL.revokeObjectURL(urlDescargada.current);
    },
    []
  );

  const olvidarArchivo = () => {
    if (urlDescargada.current) URL.revokeObjectURL(urlDescargada.current);
    urlDescargada.current = null;
    setVisorUrl(null);
    setFirmaUrl(null);
  };

  const obtenerUrl = async () => {
    if (urlDescargada.current) return urlDescargada.current;
    const blob = await abrirArchivo.mutateAsync(documento.id);
    // Un consentimiento cargado en papel suele ser una foto, no un PDF.
    setVisorEsImagen(blob.type.startsWith("image/"));
    const url = URL.createObjectURL(blob);
    urlDescargada.current = url;
    return url;
  };

  const handleCopiarEnlace = async () => {
    setErrorMsg(null);
    try {
      const resultado = await reenviarToken.mutateAsync(documento.id);
      await navigator.clipboard.writeText(resultado.url);
      setEnlaceCopiado(true);
      setTimeout(() => setEnlaceCopiado(false), 2000);
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  };

  const handleReenviarPorCorreo = async () => {
    setErrorMsg(null);
    try {
      await reenviarPorCorreo.mutateAsync(documento.id);
      setCorreoEnviado(true);
      setTimeout(() => setCorreoEnviado(false), 2000);
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  };

  const handleSubirEscaneo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      olvidarArchivo();
      subirEscaneo.mutate(
        { id: documento.id, archivo },
        {
          onError: err => setErrorMsg(handleApiError(err).message),
          onSuccess: () => onCambio?.(),
        }
      );
    }
    e.target.value = "";
  };

  const handleAbrirEnOtraPestana = async () => {
    setErrorMsg(null);
    try {
      window.open(await obtenerUrl(), "_blank");
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  };

  const handleVerAqui = async () => {
    if (visorUrl) {
      setVisorUrl(null);
      return;
    }
    setErrorMsg(null);
    try {
      setVisorUrl(await obtenerUrl());
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  };

  const handleAbrirFirma = async () => {
    setErrorMsg(null);
    setFirmaVacia(true);
    try {
      const url = await obtenerUrl();
      setVisorUrl(null);
      setFirmaUrl(url);
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  };

  const handleCancelarFirma = () => {
    setFirmaUrl(null);
    setFirmaVacia(true);
    setErrorMsg(null);
  };

  const handleGuardarFirma = async () => {
    setErrorMsg(null);
    const documentoFirmadoBase64 =
      await pdfFirmaRef.current?.generarDocumentoFirmadoBase64();

    if (!documentoFirmadoBase64) {
      setErrorMsg("Firma el documento antes de confirmar.");
      return;
    }

    try {
      await firmarProfesional.mutateAsync({
        id: documento.id,
        data: { documentoFirmadoBase64 },
      });
      olvidarArchivo();
      handleCancelarFirma();
      onCambio?.();
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  };

  const firmando = firmaUrl !== null;
  const esperaFirmaPaciente =
    documento.estado === "Pendiente" && !documento.firmaPacienteLista;
  const esperaFirmaProfesional =
    documento.requiereFirmaProfesional &&
    documento.firmaPacienteLista &&
    !documento.firmaProfesionalLista;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {encabezado}
        <div className="flex flex-wrap gap-3">
          {documento.tieneArchivo && !firmando && (
            <>
              <button
                type="button"
                onClick={handleAbrirEnOtraPestana}
                disabled={abrirArchivo.isPending}
                className={ESTILO_ACCION}
              >
                {abrirArchivo.isPending ? "Abriendo…" : "Abrir en Otra Pestaña"}
              </button>
              <button
                type="button"
                onClick={handleVerAqui}
                disabled={abrirArchivo.isPending}
                className={ESTILO_ACCION}
              >
                {abrirArchivo.isPending
                  ? "Abriendo…"
                  : visorUrl
                    ? "Ocultar Visor"
                    : "Ver Aquí"}
              </button>
            </>
          )}
          {esperaFirmaPaciente && !firmando && (
            <>
              <button
                type="button"
                onClick={handleCopiarEnlace}
                className={ESTILO_ACCION}
              >
                {enlaceCopiado ? "Enlace Copiado" : "Copiar Enlace"}
              </button>
              <button
                type="button"
                onClick={handleReenviarPorCorreo}
                className={ESTILO_ACCION}
              >
                {correoEnviado ? "Correo Enviado" : "Reenviar por Correo"}
              </button>
              <label
                className={`cursor-pointer ${ESTILO_ACCION} ${
                  subirEscaneo.isPending ? "opacity-50" : ""
                }`}
              >
                {subirEscaneo.isPending ? "Subiendo…" : "Cargar Archivo"}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  disabled={subirEscaneo.isPending}
                  onChange={handleSubirEscaneo}
                />
              </label>
            </>
          )}
          {permitirFirma && esperaFirmaProfesional && !firmando && (
            <button
              type="button"
              onClick={handleAbrirFirma}
              disabled={abrirArchivo.isPending}
              className="font-sans text-xs font-bold text-primary hover:underline disabled:opacity-40"
            >
              {abrirArchivo.isPending ? "Abriendo…" : "Firmar como Profesional"}
            </button>
          )}
        </div>
      </div>

      {errorMsg && <Alerta tono="error">{errorMsg}</Alerta>}

      {visorUrl &&
        (visorEsImagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={visorUrl}
            alt="Documento cargado en papel"
            className="max-h-[70vh] w-full rounded-overlay border border-border object-contain"
          />
        ) : (
          <iframe
            src={visorUrl}
            title="Documento"
            className="h-[70vh] w-full rounded-overlay border border-border"
          />
        ))}

      {firmaUrl && (
        <div className="border border-border bg-slate-50 p-4">
          <p className="mb-2 font-sans text-table-head font-bold uppercase tracking-widest text-muted-foreground">
            Firma sobre el documento, donde te corresponde
          </p>
          <PdfSignatureCanvas
            ref={pdfFirmaRef}
            url={firmaUrl}
            onCambiar={vacia => setFirmaVacia(vacia)}
          />
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={handleCancelarFirma}
              className="border border-border px-3 py-1.5 font-sans text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGuardarFirma}
              disabled={firmaVacia || firmarProfesional.isPending}
              className="bg-primary px-3 py-1.5 font-sans text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-40"
            >
              {firmarProfesional.isPending
                ? "Guardando…"
                : "Confirmar Firma (No se Puede Deshacer)"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
