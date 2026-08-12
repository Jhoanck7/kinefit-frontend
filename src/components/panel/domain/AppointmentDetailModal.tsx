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

  return (
    <div className="text-sm text-panel-sidebar">
      {/* Encabezado Formal (Ficha de Cita) */}
      <div className="flex items-start justify-between gap-4 border-b border-brand-border p-6">
        <div>
          <h2 className="text-lg font-bold text-panel-sidebar">
            Detalle de Reserva #{cita.id}
          </h2>
          <p className="text-xs text-brand-muted mt-0.5">
            Creada el {formatearFechaHora(cita.creadaEn)}
          </p>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="rounded-full p-1.5 text-brand-muted hover:bg-panel-fondo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
        >
          &times;
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* SECCIÓN 1: DATOS DEL PACIENTE */}
        <div className="space-y-2">
          <p className="border-b border-brand-border pb-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted">
            Datos del Paciente
          </p>
          <div className="space-y-1 text-sm pt-1">
            <div className="flex justify-between items-center">
              <span className="text-brand-muted font-medium">Nombre:</span>
              <span className="font-bold text-panel-sidebar">
                {cita.paciente.nombre} {cita.paciente.apellido}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-brand-muted font-medium">RUT:</span>
              <span className="font-semibold text-panel-sidebar">{cita.paciente.rut}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-brand-muted font-medium">Contacto:</span>
              <span className="font-medium text-panel-sidebar">
                {cita.paciente.telefono} | {cita.paciente.correo}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-brand-muted font-medium">Convenio:</span>
              <span className="font-semibold text-panel-sidebar">
                {cita.paciente.convenio ? cita.paciente.convenio.nombre : "Particular"}
              </span>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: DETALLES DE LA ATENCIÓN */}
        <div className="space-y-2">
          <p className="border-b border-brand-border pb-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted">
            Detalles de la Atención
          </p>
          <div className="space-y-2 text-sm pt-1">
            <div className="flex justify-between items-center">
              <span className="text-brand-muted font-medium">Servicio:</span>
              <span className="font-semibold text-panel-sidebar capitalize">{cita.servicio}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-brand-muted font-medium">Atiende:</span>
              <span className="font-semibold text-panel-sidebar">
                {cita.especialista.nombre} ({cita.especialista.cargo})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-brand-muted font-medium">Bloque:</span>
              <span className="font-semibold text-panel-sidebar">
                {formatearFechaExtensa(cita.fecha)} | {formatearRangoHorario(cita.horaInicio, cita.horaTermino)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-brand-muted font-medium">Origen:</span>
              <OriginBadge origen={cita.origen} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-brand-muted font-medium">Estado:</span>
              <StatusPill etiqueta={definicion.etiqueta} colorRol={definicion.colorRol} conTrama={definicion.conTrama} />
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: INFORMACIÓN DE PAGO */}
        <div className="space-y-2">
          <p className="border-b border-brand-border pb-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted">
            Información de Pago
          </p>
          <div className="space-y-1 text-sm pt-1">
            <div className="flex justify-between items-center">
              <span className="text-brand-muted font-medium">Anticipo:</span>
              <span className="font-bold text-panel-sidebar">
                {cita.montoAnticipo !== undefined
                  ? `$${cita.montoAnticipo.toLocaleString("es-CL")} CLP (Vía Webpay)`
                  : "Sin anticipo / Pago presencial"}
              </span>
            </div>
            {cita.webpayTransaccionId && (
              <div className="flex justify-between items-center">
                <span className="text-brand-muted font-medium">Transacción:</span>
                <span className="font-semibold text-panel-sidebar">{cita.webpayTransaccionId}</span>
              </div>
            )}
          </div>
        </div>

        {/* NOTAS PACIENTE E INTERNAS (SI EXISTEN) */}
        {(cita.notas?.paciente || cita.notas?.interna) && (
          <div className="space-y-2">
            <p className="border-b border-brand-border pb-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted">
              Notas Registradas
            </p>
            <div className="space-y-2 text-sm pt-1">
              {cita.notas.paciente && (
                <div className="rounded-lg border border-brand-border p-3">
                  <span className="text-xs font-semibold text-brand-muted block">Nota para el paciente:</span>
                  <span className="text-sm text-panel-sidebar">{cita.notas.paciente}</span>
                </div>
              )}
              {cita.notas.interna && (
                <div className="rounded-lg bg-panel-fondo border border-brand-border p-3">
                  <span className="text-xs font-semibold text-panel-sidebar block">Nota interna del personal:</span>
                  <span className="text-sm text-panel-sidebar">{cita.notas.interna}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECCIÓN 4: HISTORIAL Y TRAZABILIDAD */}
        <div className="space-y-2">
          <p className="border-b border-brand-border pb-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted">
            Historial y Trazabilidad
          </p>
          <div className="space-y-1.5 text-sm pt-1">
            {cita.historial.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-brand-muted font-medium">
                  {formatearFechaHora(item.fecha)}:
                </span>
                <span className="font-semibold text-panel-sidebar">
                  {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)} por {item.responsable}
                  {item.motivo ? ` (${item.motivo})` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botones de acción del pie */}
      <div className="border-t border-brand-border p-6">
        {definicion.acciones.length === 0 ? (
          <p className="text-sm text-brand-muted text-center">{definicion.explicacionSinAcciones}</p>
        ) : (
          <div className="flex flex-wrap gap-3 justify-end">
            {definicion.acciones.map((accion) => (
              <Button
                key={accion.id}
                variante={accion.estilo}
                className="flex-1 sm:flex-initial px-4 py-2 text-sm"
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
