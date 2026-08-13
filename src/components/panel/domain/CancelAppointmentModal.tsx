"use client";

import { useEffect, useState } from "react";
import { getCita, CitaResuelta } from "@/lib/panel/data/citas";
import { citaService } from "@/lib/services/cita.service";
import { Modal } from "../primitives/Modal";
import { Button } from "../primitives/Button";
import { TextAreaField } from "../primitives/CamposFormulario";

/**
 * Modal de cancelación conectado a la API de backend .NET
 */
export function CancelAppointmentModal({
  citaId,
  hoy,
  abierto,
  onVolver,
  onConfirmado,
}: {
  citaId: string | null;
  hoy: Date;
  abierto: boolean;
  onVolver: () => void;
  onConfirmado: () => void;
}) {
  const [cita, setCita] = useState<CitaResuelta | null>(null);
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!citaId || !abierto) return;
    getCita(citaId, hoy).then((resultado) => setCita(resultado ?? null));
  }, [citaId, hoy, abierto]);

  useEffect(() => {
    if (!abierto) {
      setMotivo("");
      setErrorMsg(null);
      setGuardando(false);
    }
  }, [abierto]);

  async function handleConfirmarCancelacion() {
    if (!cita || !motivo.trim()) return;

    setGuardando(true);
    setErrorMsg(null);

    try {
      await citaService.updateEstado(cita.id, "Cancelada", motivo.trim());
      onConfirmado();
    } catch (err: unknown) {
      console.error("Error al cancelar la cita en Backend:", err);
      setErrorMsg("No se pudo cancelar la cita. Inténtalo nuevamente.");
    } finally {
      setGuardando(false);
    }
  }

  const tienePagoAsociado = cita?.origen === "web" && cita.montoAnticipo !== undefined;

  return (
    <Modal abierto={abierto} onCerrar={onVolver} ancho="max-w-md">
      <div className="p-6">
        <h2 className="text-lg font-bold text-panel-sidebar">Cancelar cita</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Esta acción cancelará la cita de {cita ? `${cita.paciente.nombre} ${cita.paciente.apellido}` : "…"}.
        </p>

        {errorMsg && (
          <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
            {errorMsg}
          </div>
        )}

        {tienePagoAsociado && (
          <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            Esta cita tiene un anticipo de <strong>$10.000 CLP</strong> pagado vía Webpay. Debe
            verificarse la devolución correspondiente al paciente.
          </div>
        )}

        <div className="mt-4">
          <TextAreaField
            etiqueta="Motivo de la cancelación"
            obligatorio
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Indique el motivo de la cancelación..."
          />
        </div>

        <p className="mt-3 text-xs text-brand-muted">El bloque horario volverá a estar disponible en PostgreSQL.</p>

        <div className="mt-6 flex justify-end gap-3">
          <Button variante="secundario" onClick={onVolver} disabled={guardando}>
            Volver
          </Button>
          <Button
            variante="peligro"
            disabled={!motivo.trim() || guardando}
            onClick={handleConfirmarCancelacion}
          >
            {guardando ? "Cancelando..." : "Confirmar cancelación"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
