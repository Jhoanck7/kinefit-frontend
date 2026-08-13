"use client";

import { useEffect, useState } from "react";
import { getCita, CitaResuelta } from "@/lib/panel/data/citas";
import { definicionEstado, IdAccionCita } from "@/lib/panel/domain/estados";
import { citaService } from "@/lib/services/cita.service";
import {
  formatearFechaExtensa,
  formatearFechaHora,
  formatearRangoHorario,
} from "@/lib/panel/domain/formato";
import { Modal } from "../primitives/Modal";
import { Button } from "../primitives/Button";
import { StatusPill } from "../primitives/StatusPill";
import { OriginBadge } from "../primitives/OriginBadge";

const MAPA_ESTADO_NUEVO: Record<string, string> = {
  confirmar: "Confirmada",
  marcar_asistida: "Atendida",
  marcar_no_asistida: "NoAsistida",
};

export function AppointmentDetailModal({
  citaId,
  hoy,
  onCerrar,
  onSolicitarCancelacion,
  onEstadoCambiar,
}: {
  citaId: string | null;
  hoy: Date;
  onCerrar: () => void;
  onSolicitarCancelacion: () => void;
  onEstadoCambiar?: () => void;
}) {
  const [cita, setCita] = useState<CitaResuelta | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!citaId) {
      setCita(null);
      setErrorMsg(null);
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
    setErrorMsg(null);
    onCerrar();
  }

  async function ejecutarAccion(idAccion: IdAccionCita) {
    if (idAccion === "cancelar") {
      onSolicitarCancelacion();
      return;
    }

    const estadoNuevo = MAPA_ESTADO_NUEVO[idAccion];
    if (!estadoNuevo || !cita) return;

    setGuardando(true);
    setErrorMsg(null);

    try {
      await citaService.updateEstado(
        cita.id,
        estadoNuevo,
        undefined,
        estadoNuevo === "Confirmada" ? "Profesional" : undefined
      );

      // Recargar datos actualizados de la cita desde el backend
      const actualizada = await getCita(cita.id, hoy);
      if (actualizada) setCita(actualizada);
      onEstadoCambiar?.();
    } catch (err: unknown) {
      console.error("Error al actualizar el estado de la cita:", err);
      setErrorMsg("No se pudo cambiar el estado de la cita en el servidor.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal abierto={Boolean(citaId)} onCerrar={alCerrar}>
      {!cita ? (
        <div className="p-10 text-center text-sm text-brand-muted">Cargando…</div>
      ) : (
        <DetalleCita
          cita={cita}
          guardando={guardando}
          errorMsg={errorMsg}
          onCerrar={alCerrar}
          onAccion={ejecutarAccion}
        />
      )}
    </Modal>
  );
}

function DetalleCita({
  cita,
  guardando,
  errorMsg,
  onCerrar,
  onAccion,
}: {
  cita: CitaResuelta;
  guardando: boolean;
  errorMsg: string | null;
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

      {errorMsg && (
        <div className="mx-6 mt-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
          {errorMsg}
        </div>
      )}

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
              <span className="font-semibold text-panel-sidebar">{cita.paciente.rut || "—"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-brand-muted font-medium">Contacto:</span>
              <span className="font-medium text-panel-sidebar">
                {cita.paciente.telefono || "Sin fono"} | {cita.paciente.correo || "Sin correo"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-brand-muted font-medium">Convenio:</span>
              <span className="font-semibold text-panel-sidebar">
                {cita.paciente.convenio?.nombre || "Sin convenio"}
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
              <span className="font-semibold text-panel-sidebar capitalize">{cita.servicioNombre || cita.servicio}</span>
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
                disabled={guardando}
                className="flex-1 sm:flex-initial px-4 py-2 text-sm"
                onClick={() => onAccion(accion.id)}
              >
                {guardando ? "Procesando..." : accion.etiqueta}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
