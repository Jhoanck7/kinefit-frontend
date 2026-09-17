"use client";

import { Suspense } from "react";

import { Alerta } from "@/components/shared";

import {
  AgendaToolbar,
  AppointmentDetailModal,
  CancelAppointmentModal,
  GestionBloqueosModal,
  TimeGrid,
} from "./components";
import { useAgenda } from "./hooks";

function AgendaContent() {
  const {
    hoy,
    dia,
    especialistas,
    especialistaSeleccionado,
    estadoSeleccionado,
    especialistasAMostrar,
    agendaData,
    errorAgenda,
    rejilla,
    modalBloqueos,
    citaId,
    cancelando,
    actions,
  } = useAgenda();

  return (
    <div className="mx-auto max-w-6xl space-y-6 font-sans shadow-none">
      <AgendaToolbar
        dia={dia}
        especialistas={especialistas}
        especialistaSeleccionado={especialistaSeleccionado}
        estadoSeleccionado={estadoSeleccionado}
        onCambiarEstado={actions.setEstadoSeleccionado}
        onCambiarEspecialista={actions.setEspecialistaSeleccionado}
        onIrADia={actions.handleIrADia}
        onIrAHoy={actions.handleIrAHoy}
        onCambiarFecha={actions.handleCambiarFecha}
        onAbrirBloqueos={actions.handleAbrirBloqueos}
        onNuevaReserva={actions.handleNuevaReserva}
      />

      {errorAgenda && (
        <Alerta tono="error">
          No se pudo cargar la agenda de este día. Intenta recargar la página;
          si el problema persiste, avisa al equipo técnico.
        </Alerta>
      )}

      {/* Lista de citas del día por especialista */}
      <div className="overflow-x-auto py-2">
        <div className="flex gap-4 min-w-[600px]">
          {especialistasAMostrar.map(esp => {
            const bloques = agendaData[esp.id] ?? [];
            return (
              <div key={esp.id} className="flex-1 min-w-65">
                <h3 className="mb-3 border-b-2 border-slate-200 pb-2 font-sans text-[13px] font-bold text-foreground">
                  {esp.nombre}
                </h3>
                <TimeGrid
                  rejilla={rejilla}
                  bloques={bloques}
                  estadoFiltro={estadoSeleccionado}
                  onSeleccionarCita={actions.handleSeleccionarCita}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Modales de Gestión */}
      {citaId && !cancelando && (
        <AppointmentDetailModal
          citaId={citaId}
          hoy={hoy ?? new Date()}
          onCerrar={actions.handleCerrarDetalleCita}
          onSolicitarCancelacion={actions.handleSolicitarCancelacion}
          onEstadoCambiar={actions.cargarAgenda}
        />
      )}

      {citaId && cancelando && (
        <CancelAppointmentModal
          citaId={citaId}
          hoy={hoy ?? new Date()}
          abierto={cancelando}
          onVolver={actions.handleVolverDeCancelar}
          onConfirmado={actions.handleCancelacionConfirmada}
        />
      )}

      <GestionBloqueosModal
        abierto={modalBloqueos}
        onClose={actions.handleCerrarBloqueos}
        onBloqueoCreado={actions.cargarAgenda}
      />
    </div>
  );
}

export default function AgendaView() {
  return (
    <Suspense fallback={<div className="h-full" aria-hidden />}>
      <AgendaContent />
    </Suspense>
  );
}
