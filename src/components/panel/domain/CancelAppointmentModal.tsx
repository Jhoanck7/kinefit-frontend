"use client";

import { useEffect, useState } from "react";

import { CitaResuelta, getCita } from "@/lib/panel/data/citas";
import { citaService } from "@/lib/services/cita.service";

import { Modal } from "../primitives/Modal";

/**
 * Modal de cancelación con estilo Frameless Satoshi 100%
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
    getCita(citaId, hoy).then(resultado => setCita(resultado ?? null));
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

  const tienePagoAsociado =
    cita?.origen === "web" && cita.montoAnticipo !== undefined;

  return (
    <Modal abierto={abierto} onCerrar={onVolver} ancho="max-w-md">
      <div className="p-6 bg-white text-slate-900 font-sans rounded-none shadow-none">
        <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
          CANCELAR RESERVA{" "}
          <span className="font-sans text-slate-900 font-bold">#{citaId}</span>
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          Se cancelará la atención de{" "}
          <strong className="text-slate-900 font-semibold">
            {cita ? `${cita.paciente.nombre} ${cita.paciente.apellido}` : "…"}
          </strong>
          .
        </p>

        {errorMsg && (
          <div className="mt-3 border border-red-300 bg-red-50 p-3 font-sans text-xs font-semibold text-red-800 rounded-none">
            {errorMsg}
          </div>
        )}

        {tienePagoAsociado && (
          <div className="mt-4 border border-amber-300 bg-amber-50 p-3 font-sans text-xs text-amber-900 rounded-none">
            Esta cita tiene un anticipo de <strong>$10.000 CLP</strong> pagado
            vía Webpay. Se debe gestionar la devolución.
          </div>
        )}

        <div className="mt-4 space-y-1">
          <label className="font-sans text-[11px] font-medium uppercase tracking-wider text-slate-400 block">
            MOTIVO DE LA CANCELACIÓN *
          </label>
          <textarea
            rows={3}
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Ingrese la razón de la cancelación..."
            className="w-full border border-slate-200 bg-white p-2.5 font-sans text-xs text-slate-900 rounded-none shadow-none focus:border-slate-900 focus:outline-none"
          />
        </div>

        <p className="mt-2 font-sans text-[11px] text-slate-400">
          * El bloque horario quedará liberado automáticamente en el servidor.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onVolver}
            disabled={guardando}
            className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-none shadow-none"
          >
            VOLVER
          </button>
          <button
            type="button"
            disabled={!motivo.trim() || guardando}
            onClick={handleConfirmarCancelacion}
            className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 rounded-none shadow-none disabled:opacity-50"
          >
            {guardando ? "CANCELANDO..." : "CONFIRMAR CANCELACIÓN"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
