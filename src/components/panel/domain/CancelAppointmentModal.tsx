"use client";

import { useEffect, useState } from "react";
import { getCita, CitaResuelta } from "@/lib/panel/data/citas";
import { Modal } from "../primitives/Modal";
import { Button } from "../primitives/Button";
import { TextAreaField } from "../primitives/CamposFormulario";

/**
 * Modal de cancelación (E.3, W-5): advierte del anticipo cuando corresponde
 * y exige motivo. Se monta sobre el detalle (DD-9).
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
  const [confirmada, setConfirmada] = useState(false);

  useEffect(() => {
    if (!citaId || !abierto) return;
    getCita(citaId, hoy).then((resultado) => setCita(resultado ?? null));
  }, [citaId, hoy, abierto]);

  const handleCerrar = () => {
    setMotivo("");
    setConfirmada(false);
    onVolver();
  };

  const tienePagoAsociado = cita?.origen === "web" && cita.montoAnticipo !== undefined;

  return (
    <Modal abierto={abierto} onCerrar={handleCerrar} ancho="max-w-md">
      {confirmada ? (
        <div className="p-8 text-center">
          <h2 className="text-lg font-semibold text-panel-sidebar">Cita cancelada</h2>
          <p className="mt-2 text-sm text-brand-muted">
            El bloque horario vuelve a estar disponible.
            {tienePagoAsociado && " Recuerda verificar la devolución del anticipo al paciente."}
          </p>
          <p className="mt-3 text-xs italic text-brand-muted">
            Acción simulada: esto no se guarda realmente en el prototipo.
          </p>
          <Button variante="primario" className="mt-6" onClick={onConfirmado} autoFocus>
            Entendido
          </Button>
        </div>
      ) : (
        <div className="p-6">
          <h2 className="text-lg font-bold text-panel-sidebar">Cancelar cita</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Esta acción cancelará la cita de {cita ? `${cita.paciente.nombre} ${cita.paciente.apellido}` : "…"}.
          </p>

          {tienePagoAsociado && (
            <div className="mt-4 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-3 text-sm text-amber-800">
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

          <p className="mt-3 text-xs text-brand-muted">El bloque horario volverá a estar disponible.</p>

          <div className="mt-6 flex justify-end gap-3">
            <Button variante="secundario" onClick={handleCerrar}>
              Volver
            </Button>
            <Button variante="peligro" disabled={!motivo.trim()} onClick={() => setConfirmada(true)}>
              Confirmar cancelación
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
