"use client";

import { useEffect, useRef, useState } from "react";

import {
  NumberField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/shared";
import { Button, Card } from "@/components/ui";
import { handleApiError } from "@/lib/api";
import { generarPdfDesdeConstructor } from "@/lib/documento-pdf";
import { formatearFechaExtensa } from "@/lib/formato";

import PdfSignatureCanvas from "./components/pdf-signature-canvas";
import { useFirmaDocumento } from "./hooks";

const CODIGOS_SIN_REINTENTO = new Set([
  "TOKEN_INVALIDO",
  "TOKEN_YA_USADO",
  "TOKEN_EXPIRADO",
  "DOCUMENTO_AJENO",
]);

type Paso = "completar" | "firmar" | "revisar";

interface FirmaDocumentoViewProps {
  token: string;
}

export default function FirmaDocumentoView({ token }: FirmaDocumentoViewProps) {
  const {
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
  } = useFirmaDocumento({ token });

  const pdfFirmaRef =
    useRef<React.ComponentRef<typeof PdfSignatureCanvas>>(null);
  const [firmaVacia, setFirmaVacia] = useState(true);
  const [avisoFirma, setAvisoFirma] = useState<string | null>(null);
  const [pdfFirmadoBase64, setPdfFirmadoBase64] = useState<string | null>(null);
  const [pdfGeneradoUrl, setPdfGeneradoUrl] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);
  const [paso, setPaso] = useState<Paso>("completar");

  useEffect(() => {
    return () => {
      if (pdfGeneradoUrl) URL.revokeObjectURL(pdfGeneradoUrl);
    };
  }, [pdfGeneradoUrl]);

  if (isLoading) {
    return (
      <Centro>
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </Centro>
    );
  }

  if (error) {
    const { message, details } = handleApiError(error);
    const sinReintento = details ? CODIGOS_SIN_REINTENTO.has(details) : false;
    return (
      <Centro>
        <Card className="max-w-md border border-border p-6 text-center">
          <p className="mb-2 text-sm font-bold text-slate-900">
            No se puede abrir este documento
          </p>
          <p className="text-xs text-slate-500">{message}</p>
          {!sinReintento && (
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          )}
        </Card>
      </Centro>
    );
  }

  if (!data) return null;

  if (firmado) {
    return (
      <Centro>
        <Card className="max-w-md border border-border p-6 text-center">
          <p className="mb-2 text-sm font-bold text-slate-900">
            Documento firmado
          </p>
          <p className="text-xs text-slate-500">
            Ya podés cerrar esta ventana.
          </p>
        </Card>
      </Centro>
    );
  }

  const errorDocumentoModificado =
    errorFirma && handleApiError(errorFirma).details === "DOCUMENTO_MODIFICADO";

  const camposPaciente = (data.cuerpo?.secciones ?? []).flatMap(seccion =>
    seccion.campos.filter(
      c => c.completadoPor === "Paciente" || c.tipo === "TextoInformativo"
    )
  );

  const camposObligatoriosPendientes = camposPaciente.filter(
    c =>
      c.obligatorio &&
      c.tipo !== "TextoInformativo" &&
      c.tipo !== "Firma" &&
      !(contenido[c.id] ?? "").trim()
  );

  const urlParaFirmar = data.tieneArchivo ? archivoUrl : pdfGeneradoUrl;

  const handleGenerarDocumento = async () => {
    if (camposObligatoriosPendientes.length > 0) {
      setAvisoFirma("Completá los campos obligatorios antes de continuar.");
      return;
    }
    setAvisoFirma(null);
    setGenerando(true);
    try {
      const bytes = await generarPdfDesdeConstructor({
        nombre: data.nombre,
        servicio: data.servicio,
        fecha: formatearFechaExtensa(new Date(`${data.fecha}T00:00:00`)),
        cuerpo: data.cuerpo ?? { secciones: [] },
        contenido,
      });
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setPdfGeneradoUrl(URL.createObjectURL(blob));
      setFirmaVacia(true);
      setPaso("firmar");
    } finally {
      setGenerando(false);
    }
  };

  const handleGuardarPdf = async () => {
    const base64 = await pdfFirmaRef.current?.generarDocumentoFirmadoBase64();
    if (!base64) {
      setAvisoFirma("Firmá en el documento antes de continuar.");
      return;
    }
    setAvisoFirma(null);
    setPdfFirmadoBase64(base64);
    setPaso("revisar");
  };

  const handleEntregarPdf = async () => {
    if (!pdfFirmadoBase64) return;
    await handleFirmar(pdfFirmadoBase64);
  };

  const handleVolverAFirmar = () => {
    setPdfFirmadoBase64(null);
    setFirmaVacia(true);
    setPaso("firmar");
  };

  const handleVolverACompletar = () => {
    if (pdfGeneradoUrl) URL.revokeObjectURL(pdfGeneradoUrl);
    setPdfGeneradoUrl(null);
    setPdfFirmadoBase64(null);
    setFirmaVacia(true);
    setPaso("completar");
  };

  const debeCompletarCampos = !data.tieneArchivo && paso === "completar";

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 pb-28 pt-6">
      <header className="mb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          {data.servicio} ·{" "}
          {formatearFechaExtensa(new Date(`${data.fecha}T00:00:00`))}
        </p>
        <h1 className="mt-1 text-lg font-bold text-slate-900">{data.nombre}</h1>
      </header>

      {errorDocumentoModificado && (
        <div className="mb-4 border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
          Este documento cambió mientras lo tenías abierto, recargá la página
          para leer la versión actual antes de firmar
        </div>
      )}

      {debeCompletarCampos ? (
        <>
          <p className="mb-3 text-xs text-slate-600">
            Completá los datos que te corresponden. Después vas a poder leer el
            documento completo y firmarlo.
          </p>

          <div className="mb-6 space-y-4">
            {camposPaciente.map(campo => {
              if (campo.tipo === "TextoInformativo") {
                return (
                  <p
                    key={campo.id}
                    className="whitespace-pre-line text-xs leading-relaxed text-slate-700"
                  >
                    {campo.nombre}
                  </p>
                );
              }
              if (campo.tipo === "Firma") return null;

              const comun = {
                etiqueta: campo.nombre,
                obligatorio: campo.obligatorio,
                ayuda: campo.ayuda,
                value: contenido[campo.id] ?? "",
                onChange: (
                  e: React.ChangeEvent<
                    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
                  >
                ) => handleCambiarCampo(campo.id, e.target.value),
              };
              if (campo.tipo === "Numerico") {
                return <NumberField key={campo.id} {...comun} />;
              }
              if (campo.tipo === "TextoLargo") {
                return <TextAreaField key={campo.id} {...comun} />;
              }
              if (campo.tipo === "Fecha") {
                return <TextField key={campo.id} type="date" {...comun} />;
              }
              if (campo.tipo === "Seleccion") {
                return (
                  <SelectField key={campo.id} {...comun}>
                    <option value="">Seleccionar…</option>
                    {(campo.opciones ?? []).map(opcion => (
                      <option key={opcion} value={opcion}>
                        {opcion}
                      </option>
                    ))}
                  </SelectField>
                );
              }
              return <TextField key={campo.id} {...comun} />;
            })}
          </div>

          {avisoFirma && (
            <p className="mb-2 text-xs text-rose-600">{avisoFirma}</p>
          )}

          <div className="fixed inset-x-0 bottom-0 border-t border-border bg-white p-4">
            <div className="mx-auto max-w-3xl">
              <Button
                className="w-full"
                disabled={generando}
                onClick={handleGenerarDocumento}
              >
                {generando ? "Preparando documento…" : "Continuar"}
              </Button>
            </div>
          </div>
        </>
      ) : paso !== "revisar" ? (
        <>
          <p className="mb-3 text-xs text-slate-600">
            Leé el siguiente documento completo y firmá donde corresponda antes
            de guardar
          </p>

          <div className="mb-4">
            {urlParaFirmar && (
              <PdfSignatureCanvas
                ref={pdfFirmaRef}
                url={urlParaFirmar}
                onCambiar={vacia => {
                  setFirmaVacia(vacia);
                  if (!vacia) setAvisoFirma(null);
                }}
              />
            )}
          </div>

          {avisoFirma && (
            <p className="mb-2 text-xs text-rose-600">{avisoFirma}</p>
          )}

          <div className="fixed inset-x-0 bottom-0 border-t border-border bg-white p-4">
            <div className="mx-auto flex max-w-3xl gap-3">
              {!data.tieneArchivo && (
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={handleVolverACompletar}
                >
                  Volver a los datos
                </Button>
              )}
              <Button
                className="flex-1"
                disabled={firmaVacia}
                onClick={handleGuardarPdf}
              >
                Guardar
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="mb-3 text-xs text-slate-600">
            Revisá tu firma antes de entregar el documento — una vez entregado
            no se puede modificar
          </p>

          <div className="mb-4 border border-border" style={{ height: "70vh" }}>
            <embed
              src={pdfFirmadoBase64 ?? undefined}
              type="application/pdf"
              className="h-full w-full"
            />
          </div>

          {errorFirma && !errorDocumentoModificado && (
            <p className="mb-2 text-xs text-rose-600">
              {handleApiError(errorFirma).message}
            </p>
          )}

          <div className="fixed inset-x-0 bottom-0 flex gap-3 border-t border-border bg-white p-4">
            <div className="mx-auto flex w-full max-w-3xl gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                disabled={guardando}
                onClick={handleVolverAFirmar}
              >
                Volver a firmar
              </Button>
              <Button
                className="flex-1"
                disabled={guardando}
                onClick={handleEntregarPdf}
              >
                {guardando ? "Entregando…" : "Entregar documento"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Centro({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-4">
      {children}
    </div>
  );
}
