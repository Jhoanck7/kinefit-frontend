"use client";

import { useState } from "react";

import { Alerta, Modal, TextAreaField } from "@/components/shared";
import { Button } from "@/components/ui";
import { useRechazarDocumentoMutation } from "@/hooks/api";
import { handleApiError } from "@/lib/api";

interface RechazarDocumentoModalProps {
  documentoId: number | null;
  onCerrar: () => void;
  onRechazado?: () => void;
}

/** Modal para rechazar un consentimiento entregado indicando el motivo */
export function RechazarDocumentoModal({
  documentoId,
  onCerrar,
  onRechazado,
}: RechazarDocumentoModalProps) {
  const [motivo, setMotivo] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const rechazarMutation = useRechazarDocumentoMutation();

  function reiniciarYCerrar() {
    setMotivo("");
    setErrorMsg(null);
    onCerrar();
  }

  async function handleConfirmar() {
    if (!documentoId || !motivo.trim()) return;
    setErrorMsg(null);
    try {
      await rechazarMutation.mutateAsync({
        id: documentoId,
        data: { motivo: motivo.trim() },
      });
      onRechazado?.();
      reiniciarYCerrar();
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  }

  return (
    <Modal
      abierto={Boolean(documentoId)}
      onCerrar={reiniciarYCerrar}
      ancho="sm:max-w-md"
    >
      <div className="bg-white text-foreground font-sans p-6 space-y-4">
        <h3 className="font-sans text-section-title font-bold text-foreground">
          Rechazar Documento
        </h3>
        <Alerta tono="advertencia">
          El documento vuelve a quedar pendiente y se descarta la firma actual.
          El paciente deberá firmar de nuevo.
        </Alerta>
        {errorMsg && <Alerta tono="error">{errorMsg}</Alerta>}
        <TextAreaField
          etiqueta="Motivo"
          obligatorio
          maxLength={500}
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={reiniciarYCerrar}
            className="font-sans text-xs font-bold px-4 py-2 border border-slate-200"
          >
            Cancelar
          </button>
          <Button
            onClick={handleConfirmar}
            disabled={!motivo.trim() || rechazarMutation.isPending}
            className="bg-rose-700 text-white hover:bg-rose-800"
          >
            {rechazarMutation.isPending ? "Rechazando…" : "Confirmar Rechazo"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
