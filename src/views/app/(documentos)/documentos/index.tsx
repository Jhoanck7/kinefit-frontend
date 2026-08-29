"use client";

import { useRef, useState } from "react";

import {
  NumberField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/shared";
import { Button, Card } from "@/components/ui";
import { handleApiError } from "@/lib/api";
import { formatearFechaExtensa } from "@/lib/formato";

import SignaturePad, { SignaturePadHandle } from "./components/signature-pad";
import { useFirmaDocumento } from "./hooks";

const CODIGOS_SIN_REINTENTO = new Set([
  "TOKEN_INVALIDO",
  "TOKEN_YA_USADO",
  "TOKEN_EXPIRADO",
  "DOCUMENTO_AJENO",
]);

interface FirmaDocumentoViewProps {
  token?: string;
  documentoId?: number;
}

export default function FirmaDocumentoView({
  token,
  documentoId,
}: FirmaDocumentoViewProps) {
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
  } = useFirmaDocumento({ token, documentoId });

  const firmaRef = useRef<SignaturePadHandle>(null);
  const [firmaVacia, setFirmaVacia] = useState(true);
  const [avisoFirma, setAvisoFirma] = useState<string | null>(null);

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

  const handleClickFirmar = async () => {
    const base64 = firmaRef.current?.exportarBase64();
    if (!base64) {
      setAvisoFirma("Firmá en el recuadro antes de continuar.");
      return;
    }
    setAvisoFirma(null);
    await handleFirmar(base64);
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 pb-32 pt-6">
      <header className="mb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          {data.servicio} ·{" "}
          {formatearFechaExtensa(new Date(`${data.fecha}T00:00:00`))}
        </p>
        <h1 className="mt-1 text-lg font-bold text-slate-900">
          {data.nombreFormato}
        </h1>
      </header>

      {errorDocumentoModificado && (
        <div className="mb-4 border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
          Este documento cambió mientras lo tenías abierto. Recargá la página
          para leer la versión actual antes de firmar.
        </div>
      )}

      {data.tieneArchivo && archivoUrl && (
        <div className="mb-6 border border-border" style={{ height: "60vh" }}>
          <iframe
            src={archivoUrl}
            className="h-full w-full"
            title={data.nombreFormato}
          />
        </div>
      )}

      {camposPaciente.length > 0 && (
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
      )}

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Tu firma
        </p>
        <SignaturePad
          ref={firmaRef}
          onCambiar={vacia => {
            setFirmaVacia(vacia);
            if (!vacia) setAvisoFirma(null);
          }}
        />
        <button
          type="button"
          onClick={() => firmaRef.current?.limpiar()}
          className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900"
        >
          Borrar y firmar de nuevo
        </button>
        {avisoFirma && (
          <p className="mt-2 text-xs text-rose-600">{avisoFirma}</p>
        )}
        {errorFirma && !errorDocumentoModificado && (
          <p className="mt-2 text-xs text-rose-600">
            {handleApiError(errorFirma).message}
          </p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-white p-4">
        <div className="mx-auto max-w-2xl">
          <Button
            className="w-full"
            disabled={firmaVacia || guardando}
            onClick={handleClickFirmar}
          >
            {guardando ? "Firmando…" : "Firmar documento"}
          </Button>
        </div>
      </div>
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
