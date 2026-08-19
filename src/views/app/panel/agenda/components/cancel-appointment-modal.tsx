"use client";

import { useEffect, useState } from "react";

import { Alerta, Modal } from "@/components/shared";
import {
  useGetCita,
  useGetImpactoCancelacion,
  useUpdateCitaEstadoMutation,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";

/**
 * Modal de cancelación con estilo Frameless Satoshi 100%
 */
export function CancelAppointmentModal({
  citaId,
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
  const idNum = citaId ? Number(citaId) : 0;
  const consultasHabilitadas = abierto && Boolean(citaId);
  const { data: cita } = useGetCita(idNum, consultasHabilitadas);
  const { data: impacto } = useGetImpactoCancelacion(
    idNum,
    consultasHabilitadas
  );
  const [motivo, setMotivo] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const actualizarEstadoMutation = useUpdateCitaEstadoMutation();

  useEffect(() => {
    if (!abierto) {
      setMotivo("");
      setErrorMsg(null);
    }
  }, [abierto]);

  async function handleConfirmarCancelacion() {
    if (!cita || !motivo.trim()) return;

    setErrorMsg(null);

    try {
      await actualizarEstadoMutation.mutateAsync({
        id: cita.id,
        data: { estadoNuevo: "Cancelada", motivo: motivo.trim() },
      });
      onConfirmado();
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  }

  const guardando = actualizarEstadoMutation.isPending;

  return (
    <Modal abierto={abierto} onCerrar={onVolver}>
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
          <Alerta tono="error" className="mt-3">
            {errorMsg}
          </Alerta>
        )}

        {impacto?.tienePagoAsociado && (
          <Alerta tono="advertencia" className="mt-4">
            Esta cita tiene un anticipo de{" "}
            <strong>${impacto.montoPagado.toLocaleString("es-CL")} CLP</strong>{" "}
            pagado vía Webpay. Se debe gestionar la devolución.
          </Alerta>
        )}

        {impacto?.tieneFichaAsociada && (
          <Alerta tono="advertencia" className="mt-4">
            Esta cita ya tiene una ficha clínica asociada.
          </Alerta>
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
            className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 bg-[#003366] text-white hover:bg-[#002244] border-0 rounded-none shadow-none disabled:opacity-50"
          >
            {guardando ? "CANCELANDO..." : "CONFIRMAR CANCELACIÓN"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
