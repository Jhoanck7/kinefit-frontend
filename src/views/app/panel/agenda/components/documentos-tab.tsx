"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Alerta } from "@/components/shared";
import {
  useAbrirArchivoDocumentoMutation,
  useFirmarProfesionalMutation,
  useGetDocumentos,
  useGetDocumentosPorCita,
  useReenviarPorCorreoMutation,
  useReenviarTokenMutation,
  useSubirEscaneoMutation,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import { FirmarProfesionalRequest } from "@/models/requests";
import { CitaDetalleResponse } from "@/models/responses";
import { useNuevaFichaStore } from "@/stores";
import PdfSignatureCanvas from "@/views/app/(documentos)/documentos/components/pdf-signature-canvas";

export function DocumentosTab({ cita }: { cita: CitaDetalleResponse }) {
  const citaId = cita.id;
  const router = useRouter();
  const { setReserva, reiniciar } = useNuevaFichaStore();
  const { data: documentos, isLoading } = useGetDocumentosPorCita(citaId);
  const { data: fichasDeLaCita } = useGetDocumentos({
    citaId,
    tipo: "FichaClinica",
    pageSize: 5,
  });
  const ficha = fichasDeLaCita?.items?.[0] ?? null;
  const puedeRegistrarFicha =
    cita.estado === "Confirmada" || cita.estado === "Atendida";

  const handleRegistrarFicha = () => {
    reiniciar();
    setReserva(
      String(cita.paciente.id),
      `${cita.paciente.nombre} ${cita.paciente.apellido}`,
      String(citaId)
    );
    router.push("/panel/documentos/nueva/contenido");
  };

  const handleAbrirFicha = (id: number) =>
    router.push(`/panel/documentos?documento=${id}`);
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
  const [visorInline, setVisorInline] = useState<{
    id: number;
    url: string;
  } | null>(null);
  const pdfFirmaRef =
    useRef<React.ComponentRef<typeof PdfSignatureCanvas>>(null);
  const archivosDescargados = useRef<Map<number, string>>(new Map());

  useEffect(() => {
    const descargados = archivosDescargados.current;
    return () => {
      descargados.forEach(url => URL.revokeObjectURL(url));
      descargados.clear();
    };
  }, []);

  if (isLoading) {
    return (
      <p className="p-6 font-sans text-xs text-slate-500">
        Cargando documentos…
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
    if (archivo) {
      olvidarArchivo(id);
      subirEscaneo.mutate({ id, archivo });
    }
    e.target.value = "";
  };

  const olvidarArchivo = (id: number) => {
    const descargado = archivosDescargados.current.get(id);
    if (!descargado) return;
    URL.revokeObjectURL(descargado);
    archivosDescargados.current.delete(id);
    setVisorInline(actual => (actual?.id === id ? null : actual));
  };

  const obtenerUrlArchivo = async (id: number) => {
    const descargado = archivosDescargados.current.get(id);
    if (descargado) return descargado;
    const blob = await abrirArchivo.mutateAsync(id);
    const url = URL.createObjectURL(blob);
    archivosDescargados.current.set(id, url);
    return url;
  };

  const handleVerDocumento = async (id: number) => {
    setErrorMsg(null);
    try {
      window.open(await obtenerUrlArchivo(id), "_blank");
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  };

  const handleVerDocumentoAqui = async (id: number) => {
    if (visorInline?.id === id) {
      setVisorInline(null);
      return;
    }
    setErrorMsg(null);
    try {
      setVisorInline({ id, url: await obtenerUrlArchivo(id) });
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  };

  const handleAbrirFirma = async (id: number) => {
    setErrorMsg(null);
    setFirmaVacia(true);
    try {
      setPdfUrl(await obtenerUrlArchivo(id));
      setFirmandoId(id);
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  };

  const handleCancelarFirma = () => {
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
      olvidarArchivo(firmandoId);
      handleCancelarFirma();
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  };

  return (
    <div className="divide-y divide-slate-200 p-6">
      {errorMsg && (
        <Alerta tono="error" className="mb-3">
          {errorMsg}
        </Alerta>
      )}

      <div className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-sans text-sm font-semibold text-slate-900">
            Ficha Clínica
          </p>
          <p className="font-sans text-xs text-slate-500">
            {ficha
              ? ficha.estado
              : puedeRegistrarFicha
                ? "Esta reserva todavía no tiene ficha"
                : `La cita debe estar Confirmada o Atendida, está ${cita.estado}`}
          </p>
        </div>
        {ficha ? (
          <button
            type="button"
            onClick={() => handleAbrirFicha(ficha.id)}
            className="font-sans text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            Abrir Ficha
          </button>
        ) : (
          puedeRegistrarFicha && (
            <button
              type="button"
              onClick={handleRegistrarFicha}
              className="font-sans text-xs font-bold text-primary hover:underline"
            >
              Registrar Ficha
            </button>
          )
        )}
      </div>

      {(!documentos || documentos.length === 0) && (
        <p className="py-3 font-sans text-xs text-slate-500">
          Este servicio no exige consentimientos.
        </p>
      )}

      {(documentos ?? []).map(doc => (
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
                <>
                  <button
                    type="button"
                    onClick={() => handleVerDocumento(doc.id)}
                    disabled={abrirArchivo.isPending}
                    className="font-sans text-xs font-bold text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    {abrirArchivo.isPending
                      ? "Abriendo…"
                      : "Abrir en Otra Pestaña"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerDocumentoAqui(doc.id)}
                    disabled={abrirArchivo.isPending}
                    className="font-sans text-xs font-bold text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    {abrirArchivo.isPending
                      ? "Abriendo…"
                      : visorInline?.id === doc.id
                        ? "Ocultar Visor"
                        : "Ver Aquí"}
                  </button>
                </>
              )}
              {doc.estado === "Pendiente" && !doc.firmaPacienteLista && (
                <>
                  <button
                    type="button"
                    onClick={() => handleReemitir(doc.id)}
                    className="font-sans text-xs font-bold text-muted-foreground hover:text-foreground"
                  >
                    {enlaceCopiadoId === doc.id
                      ? "Enlace Copiado"
                      : "Copiar Enlace"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReenviarPorCorreo(doc.id)}
                    className="font-sans text-xs font-bold text-muted-foreground hover:text-foreground"
                  >
                    {correoEnviadoId === doc.id
                      ? "Correo Enviado"
                      : "Reenviar por Correo"}
                  </button>
                  <label className="cursor-pointer font-sans text-xs font-bold text-muted-foreground hover:text-foreground">
                    Cargar Archivo
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
                    className="font-sans text-xs font-bold text-primary hover:underline disabled:opacity-40"
                  >
                    {abrirArchivo.isPending
                      ? "Abriendo…"
                      : "Firmar como Profesional"}
                  </button>
                )}
            </div>
          </div>

          {visorInline?.id === doc.id && (
            <iframe
              src={visorInline.url}
              title={doc.nombrePlantilla}
              className="h-[70vh] w-full rounded-overlay border border-slate-200"
            />
          )}

          {firmandoId === doc.id && pdfUrl && (
            <div className="mt-2 border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 font-sans text-[11px] font-bold text-muted-foreground">
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
                  className="font-sans text-xs font-bold px-3 py-1.5 border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleGuardarFirmaProfesional}
                  disabled={firmaVacia || firmarProfesional.isPending}
                  className="font-sans text-xs font-bold px-3 py-1.5 bg-primary hover:bg-primary-hover text-white disabled:opacity-40"
                >
                  {firmarProfesional.isPending
                    ? "Guardando…"
                    : "Confirmar Firma (No se Puede Deshacer)"}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
