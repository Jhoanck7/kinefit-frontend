"use client";

import { useState } from "react";

import {
  Alerta,
  Modal,
  ModalCloseButton,
  TextAreaField,
} from "@/components/shared";
import { Button } from "@/components/ui";
import { useGetContenido, useUpdateContenidoMutation } from "@/hooks/api";
import { handleApiError } from "@/lib/api";

const CLAVE_TERMINOS = "terminos";
const CLAVE_PRIVACIDAD = "privacidad";

interface DocumentosLegalesModalProps {
  abierto: boolean;
  onCerrar: () => void;
}

/** Modal para editar los Términos y Condiciones y la Política de Privacidad del sitio público */
export function DocumentosLegalesModal({
  abierto,
  onCerrar,
}: DocumentosLegalesModalProps) {
  const { data: contenido, isLoading } = useGetContenido(abierto);

  const valorDe = (clave: string) =>
    contenido?.find(c => c.clave === clave)?.valor ?? "";

  return (
    <Modal abierto={abierto} onCerrar={onCerrar}>
      <div className="bg-white text-foreground font-sans shadow-none rounded-overlay">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm px-6 py-4">
          <h2 className="font-sans text-section-title font-bold text-foreground">
            Configuración: Documentos Legales
          </h2>
          <ModalCloseButton onClick={onCerrar} />
        </div>

        {isLoading || !contenido ? (
          <p className="text-sm text-slate-500 py-8 text-center">
            Cargando documentos…
          </p>
        ) : (
          <FormularioDocumentosLegales
            terminosInicial={valorDe(CLAVE_TERMINOS)}
            privacidadInicial={valorDe(CLAVE_PRIVACIDAD)}
            onCerrar={onCerrar}
          />
        )}
      </div>
    </Modal>
  );
}

function FormularioDocumentosLegales({
  terminosInicial,
  privacidadInicial,
  onCerrar,
}: {
  terminosInicial: string;
  privacidadInicial: string;
  onCerrar: () => void;
}) {
  const [terminos, setTerminos] = useState(terminosInicial);
  const [privacidad, setPrivacidad] = useState(privacidadInicial);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const actualizarMutation = useUpdateContenidoMutation();

  const cambios = [
    { clave: CLAVE_TERMINOS, valor: terminos, inicial: terminosInicial },
    { clave: CLAVE_PRIVACIDAD, valor: privacidad, inicial: privacidadInicial },
  ].filter(c => c.valor !== c.inicial);

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    try {
      for (const cambio of cambios) {
        await actualizarMutation.mutateAsync({
          clave: cambio.clave,
          valor: cambio.valor,
        });
      }
      fetch("/api/revalidate", { method: "POST" }).catch(() => {});
      onCerrar();
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  }

  return (
    <form
      onSubmit={handleGuardar}
      className="max-h-[75vh] overflow-y-auto p-6 space-y-6"
    >
      <TextAreaField
        etiqueta="Términos y Condiciones"
        rows={14}
        value={terminos}
        onChange={e => setTerminos(e.target.value)}
      />
      <TextAreaField
        etiqueta="Política de Privacidad"
        rows={14}
        value={privacidad}
        onChange={e => setPrivacidad(e.target.value)}
      />

      {errorMsg && <Alerta tono="error">{errorMsg}</Alerta>}

      <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          className="rounded-overlay"
          onClick={onCerrar}
        >
          Cerrar sin Guardar
        </Button>
        <Button
          type="submit"
          className="rounded-overlay"
          disabled={actualizarMutation.isPending || cambios.length === 0}
        >
          {actualizarMutation.isPending ? "Guardando…" : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
