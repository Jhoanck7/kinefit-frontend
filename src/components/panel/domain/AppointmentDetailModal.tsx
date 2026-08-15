"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CitaResuelta, getCita } from "@/lib/panel/data/citas";
import { definicionEstado, IdAccionCita } from "@/lib/panel/domain/estados";
import {
  formatearFechaExtensa,
  formatearFechaHora,
  formatearRangoHorario,
} from "@/lib/panel/domain/formato";
import { citaService } from "@/services";

import { Modal } from "../primitives/Modal";

const MAPA_ESTADO_NUEVO: Record<string, string> = {
  confirmar: "Confirmada",
  marcar_asistida: "Atendida",
  marcar_no_asistida: "NoAsistida",
};

const DOT_COLOR: Record<string, string> = {
  "azul-seleccion": "bg-blue-600",
  ambar: "bg-amber-500",
  verde: "bg-emerald-500",
  "azul-profundo": "bg-indigo-700",
  rojo: "bg-red-500",
  gris: "bg-slate-400",
};

const TEXTO_COLOR: Record<string, string> = {
  "azul-seleccion": "text-blue-700",
  ambar: "text-amber-700",
  verde: "text-emerald-700",
  "azul-profundo": "text-indigo-800",
  rojo: "text-red-700",
  gris: "text-slate-600",
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
    getCita(citaId, hoy).then(resultado => {
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
      await citaService.updateEstado(Number(cita.id), {
        estadoNuevo,
        confirmadoPor: estadoNuevo === "Confirmada" ? "Profesional" : undefined,
      });

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
    <Modal abierto={Boolean(citaId)} onCerrar={alCerrar} ancho="max-w-3xl">
      {!cita ? (
        <div className="p-8 text-center font-sans text-xs text-slate-500">
          Cargando reserva…
        </div>
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
  const dotColor = DOT_COLOR[definicion.colorRol] ?? "bg-slate-400";
  const textoColor = TEXTO_COLOR[definicion.colorRol] ?? "text-slate-600";

  return (
    <div className="bg-white text-slate-900 font-sans shadow-none rounded-none">
      {/* Encabezado del Modal */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
              Detalle de Reserva{" "}
              <span className="font-sans font-bold text-slate-900">
                #{cita.id}
              </span>
            </h2>
            <span className="border border-slate-200 bg-white px-2 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wider text-slate-700 rounded-none">
              {cita.origen === "web" ? "WEB" : "MANUAL"}
            </span>
          </div>
          <p className="font-sans text-xs text-slate-500 mt-0.5">
            Creada el{" "}
            <span className="font-sans text-slate-700 font-medium">
              {formatearFechaHora(cita.creadaEn)}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="p-1 font-sans text-sm text-slate-400 hover:text-slate-900 rounded-none focus:outline-none"
        >
          ✕
        </button>
      </div>

      {errorMsg && (
        <div className="mx-6 mt-4 border border-red-300 bg-red-50 p-3 font-sans text-xs font-medium text-red-800 rounded-none">
          {errorMsg}
        </div>
      )}

      {/* Cuerpo en Layout de 2 Columnas (Principal + Lateral Interno Paciente) */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        {/* COLUMNA IZQUIERDA PRINCIPAL (2/3) */}
        <div className="md:col-span-2 p-6 space-y-6">
          {/* DETALLES DE LA ATENCIÓN */}
          <div>
            <h3 className="border-b border-slate-200 pb-1 font-sans text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-3">
              DETALLES DE LA ATENCIÓN
            </h3>
            <div className="space-y-3">
              <div>
                <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Servicio
                </span>
                <span className="font-sans font-medium text-sm text-slate-900 capitalize block mt-0.5">
                  {cita.servicioNombre || cita.servicio}
                </span>
              </div>

              <div>
                <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Especialista
                </span>
                <span className="font-sans font-medium text-sm text-slate-900 block mt-0.5">
                  {cita.especialista.nombre} ({cita.especialista.cargo})
                </span>
              </div>

              <div>
                <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Fecha y Horario
                </span>
                <span className="font-sans font-medium text-sm text-slate-900 block mt-0.5">
                  {formatearFechaExtensa(cita.fecha)} ·{" "}
                  {formatearRangoHorario(cita.horaInicio, cita.horaTermino)}
                </span>
              </div>

              <div>
                <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Estado Actual
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className={`h-2 w-2 rounded-full ${dotColor}`}
                    aria-hidden
                  />
                  <span
                    className={`font-sans text-xs font-bold uppercase tracking-wider ${textoColor}`}
                  >
                    {definicion.etiqueta}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* INFORMACIÓN DE PAGO */}
          <div>
            <h3 className="border-b border-slate-200 pb-1 font-sans text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-3">
              INFORMACIÓN DE PAGO
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Monto Anticipo
                </span>
                <span className="font-sans font-medium text-sm text-slate-900 mt-0.5 block">
                  {cita.montoAnticipo !== undefined
                    ? `$${cita.montoAnticipo.toLocaleString("es-CL")} CLP`
                    : "Sin anticipo / Pago presencial"}
                </span>
              </div>
              {cita.webpayTransaccionId && (
                <div>
                  <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                    N° Transacción Webpay
                  </span>
                  <span className="font-sans font-medium text-sm text-slate-900 mt-0.5 block">
                    {cita.webpayTransaccionId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* NOTAS REGISTRADAS */}
          {(cita.notas?.paciente || cita.notas?.interna) && (
            <div>
              <h3 className="border-b border-slate-200 pb-1 font-sans text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-3">
                NOTAS REGISTRADAS
              </h3>
              <div className="space-y-2">
                {cita.notas.paciente && (
                  <div className="border border-slate-200 bg-slate-50/60 p-3 rounded-none">
                    <span className="font-sans text-[10px] uppercase font-medium text-slate-400 block mb-1">
                      Nota para Paciente
                    </span>
                    <span className="font-sans font-medium text-sm text-slate-900">
                      {cita.notas.paciente}
                    </span>
                  </div>
                )}
                {cita.notas.interna && (
                  <div className="border border-slate-200 bg-slate-50 p-3 rounded-none">
                    <span className="font-sans text-[10px] uppercase font-medium text-slate-400 block mb-1">
                      Nota Interna del Personal
                    </span>
                    <span className="font-sans font-medium text-sm text-slate-900">
                      {cita.notas.interna}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA SECUNDARIA (1/3) - FICHA RÁPIDA PACIENTE */}
        <div className="md:col-span-1 bg-slate-50/80 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="border-b border-slate-200 pb-1 font-sans text-[10px] font-medium uppercase tracking-widest text-slate-400">
              FICHA DEL PACIENTE
            </h3>

            <div>
              <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Nombre
              </span>
              <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                {cita.paciente.nombre} {cita.paciente.apellido}
              </p>
            </div>

            <div>
              <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                RUT
              </span>
              <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                {cita.paciente.rut || "—"}
              </p>
            </div>

            <div>
              <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Teléfono
              </span>
              <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                {cita.paciente.telefono || "—"}
              </p>
            </div>

            <div>
              <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Correo Electrónico
              </span>
              <p
                className="font-sans font-medium text-sm text-slate-900 mt-0.5 truncate"
                title={cita.paciente.correo}
              >
                {cita.paciente.correo || "—"}
              </p>
            </div>

            <div>
              <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Convenio
              </span>
              <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                {cita.paciente.convenio?.nombre || "Sin convenio"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pie de Acciones */}
      <div className="border-t border-slate-200 bg-slate-50/60 p-4">
        {definicion.acciones.length === 0 ? (
          <p className="font-sans text-xs text-slate-500 text-center">
            {definicion.explicacionSinAcciones}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 justify-end">
            {definicion.acciones.map(accion => {
              const esPrimario = accion.estilo === "primario";
              const esPeligro = accion.estilo === "peligro";

              let estiloBtn =
                "border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 shadow-none";
              if (esPrimario) {
                estiloBtn =
                  "bg-[#003366] text-white hover:bg-[#002244] border-0 font-bold shadow-none";
              } else if (esPeligro) {
                estiloBtn =
                  "border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 shadow-none";
              }

              return (
                <button
                  key={accion.id}
                  disabled={guardando}
                  onClick={() => onAccion(accion.id)}
                  className={`font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-none transition-all focus:outline-none ${estiloBtn} disabled:opacity-50`}
                >
                  {guardando ? "PROCESANDO..." : accion.etiqueta}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
