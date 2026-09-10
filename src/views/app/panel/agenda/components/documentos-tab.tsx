"use client";

import { useRef, useState } from "react";

import {
  useAbrirArchivoDocumentoMutation,
  useFirmarProfesionalMutation,
  useGetDocumentosPorCita,
  useReenviarPorCorreoMutation,
  useReenviarTokenMutation,
  useSubirEscaneoMutation,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import { FirmarProfesionalRequest } from "@/models/requests";
import PdfSignatureCanvas from "@/views/app/(documentos)/documentos/components/pdf-signature-canvas";

export function DocumentosTab({ citaId }: { citaId: number }) {
  const { data: documentos, isLoading } = useGetDocumentosPorCita(citaId);
  const firmarProfesional = useFirmarProfesionalMutation();
  const subirEscaneo = useSubirEscaneoMutation();
  const reenviarToken = useReenviarTokenMutation();
  const reenviarPorCorreo = useReenviarPorCorreoMutation();
  const abrirArchivo = useAbrirArchivoDocumentoMutation();
  const [enlaceCopiadoId, setEnlaceCopiadoId] = useState<number | null>(null);
  const [correoEnviadoId, setCorreoEnviadoId] = useState<number | null>(null);
  const [firmandoId, setFirmandoId] = useState<number | null>(null);
  const [firmaVacia, setFirmaVacia] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const pdfFirmaRef =
    useRef<React.ComponentRef<typeof PdfSignatureCanvas>>(null);

  if (isLoading) {
    return (
      <p className="p-6 font-sans text-xs text-slate-500">
        Cargando documentos…
      </p>
    );
  }

  if (!documentos || documentos.length === 0) {
    return (
      <p className="p-6 font-sans text-xs text-slate-500">
        Este servicio no exige documentos.
      </p>
    );
  }

  const handleReemitir = async (id: number) => {
    const resultado = await reenviarToken.mutateAsync(id);
    await navigator.clipboard.writeText(resultado.url);
    setEnlaceCopiadoId(id);
    setTimeout(() => setEnlaceCopiadoId(null), 2000);
  };

  const handleReenviarPorCorreo = async (id: number) => {
    await reenviarPorCorreo.mutateAsync(id);
    setCorreoEnviadoId(id);
    setTimeout(() => setCorreoEnviadoId(null), 2000);
  };

  const handleSubirEscaneo = (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const archivo = e.target.files?.[0];
    if (archivo) subirEscaneo.mutate({ id, archivo });
    e.target.value = "";
  };

  const handleVerDocumento = async (id: number) => {
    setErrorMsg(null);
    try {
      const blob = await abrirArchivo.mutateAsync(id);
      window.open(URL.createObjectURL(blob), "_blank");
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  };

  const handleAbrirFirma = async (id: number) => {
    setErrorMsg(null);
    setFirmaVacia(true);
    try {
      const blob = await abrirArchivo.mutateAsync(id);
      setPdfUrl(URL.createObjectURL(blob));
      setFirmandoId(id);
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  };

  const handleCancelarFirma = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setFirmandoId(null);
    setFirmaVacia(true);
    setErrorMsg(null);
  };

  const handleGuardarFirmaProfesional = async () => {
    if (!firmandoId) return;
    setErrorMsg(null);

    const documentoFirmadoBase64 =
      await pdfFirmaRef.current?.generarDocumentoFirmadoBase64();

    if (!documentoFirmadoBase64) {
      setErrorMsg("Firmá el documento antes de confirmar.");
      return;
    }

    const data: FirmarProfesionalRequest = { documentoFirmadoBase64 };

    try {
      await firmarProfesional.mutateAsync({ id: firmandoId, data });
      handleCancelarFirma();
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  };

  return (
    <div className="divide-y divide-slate-200 p-6">
      {errorMsg && (
        <p className="mb-3 border border-rose-200 bg-rose-50 p-2 font-sans text-xs text-rose-700">
          {errorMsg}
        </p>
      )}
      {documentos.map(doc => (
        <div
          key={doc.id}
          className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-sans text-sm font-semibold text-slate-900">
                {doc.nombrePlantilla}
              </p>
              <p className="font-sans text-xs text-slate-500">
                {doc.estado}
                {doc.reutilizado ? " · cubierto por una firma anterior" : ""}
                {doc.cargadoEnPapelEn ? " · cargado en papel" : ""}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {doc.tieneArchivo && firmandoId !== doc.id && (
                <button
                  type="button"
                  onClick={() => handleVerDocumento(doc.id)}
                  className="font-sans text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
                >
                  Ver documento
                </button>
              )}
              {doc.estado === "Pendiente" && !doc.firmaPacienteLista && (
                <>
                  <button
                    type="button"
                    onClick={() => handleReemitir(doc.id)}
                    className="font-sans text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
                  >
                    {enlaceCopiadoId === doc.id
                      ? "Enlace copiado"
                      : "Copiar enlace"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReenviarPorCorreo(doc.id)}
                    className="font-sans text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
                  >
                    {correoEnviadoId === doc.id
                      ? "Correo enviado"
                      : "Reenviar por correo"}
                  </button>
                  <label className="cursor-pointer font-sans text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900">
                    Cargar escaneo
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={e => handleSubirEscaneo(doc.id, e)}
                    />
                  </label>
                </>
              )}
              {doc.requiereFirmaProfesional &&
                doc.firmaPacienteLista &&
                !doc.firmaProfesionalLista &&
                firmandoId !== doc.id && (
                  <button
                    type="button"
                    onClick={() => handleAbrirFirma(doc.id)}
                    disabled={abrirArchivo.isPending}
                    className="font-sans text-xs font-bold uppercase tracking-wider text-[#003366] hover:underline disabled:opacity-40"
                  >
                    {abrirArchivo.isPending
                      ? "Abriendo…"
                      : "Firmar como profesional"}
                  </button>
                )}
            </div>
          </div>

          {firmandoId === doc.id && pdfUrl && (
            <div className="mt-2 border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 font-sans text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Firmá sobre el documento, donde te corresponde
              </p>
              <PdfSignatureCanvas
                ref={pdfFirmaRef}
                url={pdfUrl}
                onCambiar={vacia => setFirmaVacia(vacia)}
              />
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={handleCancelarFirma}
                  className="font-sans text-xs font-bold uppercase tracking-wider px-3 py-1.5 border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleGuardarFirmaProfesional}
                  disabled={firmaVacia || firmarProfesional.isPending}
                  className="font-sans text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-[#003366] hover:bg-[#002244] text-white disabled:opacity-40"
                >
                  {firmarProfesional.isPending
                    ? "Guardando…"
                    : "Confirmar firma (no se puede deshacer)"}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
