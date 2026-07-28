"use client";

import { useEffect, useState } from "react";
import { getCita, CitaResuelta } from "@/lib/panel/data/citas";
import { definicionEstado, IdAccionCita } from "@/lib/panel/domain/estados";
import {
  formatearFechaExtensa,
  formatearFechaHora,
  formatearRangoHorario,
} from "@/lib/panel/domain/formato";
import { Modal } from "../primitives/Modal";
import { Button } from "../primitives/Button";
import { StatusPill } from "../primitives/StatusPill";
import { OriginBadge } from "../primitives/OriginBadge";
import { AuditTrail } from "./AuditTrail";

const MENSAJES_ACCION: Record<IdAccionCita, { titulo: string; descripcion: string }> = {
  confirmar: {
    titulo: "Cita confirmada",
    descripcion: "La cita pasó a estado Confirmada. El paciente será notificado.",
  },
  marcar_asistida: {
    titulo: "Cita marcada como asistida",
    descripcion: "La cita quedó registrada como Atendida.",
  },
  marcar_no_asistida: {
    titulo: "Cita marcada como no asistida",
    descripcion: "La cita quedó registrada como No asistida.",
  },
  cancelar: { titulo: "", descripcion: "" },
};

export function AppointmentDetailModal({
  citaId,
  hoy,
  onCerrar,
  onSolicitarCancelacion,
}: {
  citaId: string | null;
  hoy: Date;
  onCerrar: () => void;
  onSolicitarCancelacion: () => void;
}) {
  const [cita, setCita] = useState<CitaResuelta | null>(null);
  const [confirmacion, setConfirmacion] = useState<{ titulo: string; descripcion: string } | null>(null);

  useEffect(() => {
    if (!citaId) {
      setCita(null);
      setConfirmacion(null);
      return;
    }
    let cancelado = false;
    getCita(citaId, hoy).then((resultado) => {
      if (!cancelado) setCita(resultado ?? null);
    });
    return () => {
      cancelado = true;
    };
  }, [citaId, hoy]);

  function alCerrar() {
    setConfirmacion(null);
    onCerrar();
  }

  function ejecutarAccion(idAccion: IdAccionCita) {
    if (idAccion === "cancelar") {
      onSolicitarCancelacion();
      return;
    }
    setConfirmacion(MENSAJES_ACCION[idAccion]);
  }

  return (
    <Modal abierto={Boolean(citaId)} onCerrar={alCerrar}>
      {!cita ? (
        <div className="p-10 text-center text-sm text-brand-muted">Cargando…</div>
      ) : confirmacion ? (
        <div className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-panel-sidebar">{confirmacion.titulo}</h2>
          <p className="mt-2 text-sm text-brand-muted">{confirmacion.descripcion}</p>
          <p className="mt-3 text-xs italic text-brand-muted">
            Acción simulada: esto no se guarda realmente en el prototipo.
          </p>
          <Button variante="primario" className="mt-6" onClick={alCerrar} autoFocus>
            Entendido
          </Button>
        </div>
      ) : (
        <DetalleCita cita={cita} onCerrar={alCerrar} onAccion={ejecutarAccion} />
      )}
    </Modal>
  );
}

function DetalleCita({
  cita,
  onCerrar,
  onAccion,
}: {
  cita: CitaResuelta;
  onCerrar: () => void;
  onAccion: (idAccion: IdAccionCita) => void;
}) {
  const definicion = definicionEstado(cita.estado);
  const pagoCompletado = cita.origen === "web" && cita.montoAnticipo !== undefined;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 border-b border-brand-border p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-panel-sidebar text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286z" />
            </svg>
          </span>
          <div>
            <h2 className="text-lg font-bold text-panel-sidebar">
              {cita.paciente.nombre} {cita.paciente.apellido} — {formatearFechaExtensa(cita.fecha)},{" "}
              {formatearRangoHorario(cita.horaInicio, cita.horaTermino)}
            </h2>
            <p className="text-xs text-brand-muted">
              Cita {cita.id} • Creada el {formatearFechaHora(cita.creadaEn)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="rounded-full p-1.5 text-brand-muted hover:bg-panel-fondo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
        >
          ✕
        </button>
      </div>

      {pagoCompletado && (
        <div className="mx-6 mt-6 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-4">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Anticipo vía Webpay
          </p>
          <p className="mt-2 text-[11px] uppercase tracking-wide text-brand-muted">Monto abonado</p>
          <p className="text-xl font-bold text-panel-sidebar">${cita.montoAnticipo?.toLocaleString("es-CL")} CLP</p>
          <p className="mt-1 text-xs text-brand-muted">Transacción {cita.webpayTransaccionId}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
        <div>
          <p className="mb-3 border-b border-brand-border pb-1 text-xs font-semibold uppercase tracking-wider text-brand-muted">
            Datos paciente
          </p>
          <p className="font-bold text-panel-sidebar">
            {cita.paciente.nombre} {cita.paciente.apellido}
          </p>
          <p className="text-sm text-brand-muted">RUT: {cita.paciente.rut}</p>
          <p className="mt-2 text-sm text-brand-muted">📞 {cita.paciente.telefono}</p>
          <p className="text-sm text-brand-muted">✉ {cita.paciente.correo}</p>
          {cita.paciente.convenio && (
            <p className="mt-2 text-sm text-brand-muted">Convenio: {cita.paciente.convenio.nombre}</p>
          )}
        </div>
        <div>
          <p className="mb-3 border-b border-brand-border pb-1 text-xs font-semibold uppercase tracking-wider text-brand-muted">
            Detalles cita
          </p>
          <p className="font-bold text-panel-sidebar capitalize">{cita.servicio}</p>
          <p className="mt-2 font-bold text-panel-sidebar">{cita.especialista.nombre}</p>
          <p className="text-sm text-brand-muted">{cita.especialista.cargo}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm text-brand-muted">
              Origen: <OriginBadge origen={cita.origen} />
            </span>
            <StatusPill etiqueta={definicion.etiqueta} colorRol={definicion.colorRol} conTrama={definicion.conTrama} />
          </div>
        </div>
      </div>

      {(cita.notas?.paciente || cita.notas?.interna) && (
        <div className="space-y-3 px-6 pb-2">
          {cita.notas.paciente && (
            <div className="rounded-lg border border-brand-border p-3">
              <p className="text-xs font-semibold text-brand-muted">Nota para el paciente</p>
              <p className="text-sm text-panel-sidebar">{cita.notas.paciente}</p>
            </div>
          )}
          {cita.notas.interna && (
            <div className="rounded-lg bg-panel-seleccion p-3">
              <p className="flex items-center gap-1 text-xs font-semibold text-panel-sidebar">🔒 Nota interna</p>
              <p className="text-sm text-panel-sidebar">{cita.notas.interna}</p>
            </div>
          )}
        </div>
      )}

      <div className="px-6 pb-6 pt-2">
        <AuditTrail historial={cita.historial} />
      </div>

      <div className="border-t border-brand-border p-6">
        {definicion.acciones.length === 0 ? (
          <p className="text-sm text-brand-muted">{definicion.explicacionSinAcciones}</p>
        ) : (
          <div className="flex gap-3">
            {definicion.acciones.map((accion) => (
              <Button
                key={accion.id}
                variante={accion.estilo}
                className="flex-1"
                onClick={() => onAccion(accion.id)}
              >
                {accion.etiqueta}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
