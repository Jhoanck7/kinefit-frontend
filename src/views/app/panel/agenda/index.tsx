"use client";

import { Suspense } from "react";

import {
  AgendaToolbar,
  AppointmentDetailModal,
  CancelAppointmentModal,
  GestionBloqueosModal,
  Legend,
  TimeGrid,
} from "./components";
import { useAgenda } from "./hooks";

function AgendaContent() {
  const {
    hoy,
    dia,
    horaActual,
    especialistas,
    especialistaSeleccionado,
    especialistasAMostrar,
    agendaData,
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
        onCambiarEspecialista={actions.setEspecialistaSeleccionado}
        onIrADia={actions.handleIrADia}
        onIrAHoy={actions.handleIrAHoy}
        onCambiarFecha={actions.handleCambiarFecha}
        onAbrirBloqueos={actions.handleAbrirBloqueos}
        onNuevaReserva={actions.handleNuevaReserva}
      />

      {/* Parrilla de Tiempo (TimeGrid) Frameless */}
      <div className="overflow-x-auto py-2">
        <div className="flex gap-6 min-w-[600px]">
          {especialistasAMostrar.map((esp, index) => {
            const bloques = agendaData[esp.id] ?? [];
            return (
              <div key={esp.id} className="flex-1 min-w-[180px]">
                <h3 className="mb-4 text-center font-sans font-semibold text-sm text-slate-800 tracking-wide">
                  {esp.nombre}
                </h3>
                <TimeGrid
                  rejilla={rejilla}
                  bloques={bloques}
                  horaActual={horaActual}
                  ocultarHoras={index > 0}
                  onSeleccionarCita={actions.handleSeleccionarCita}
                  onSeleccionarBloqueVacio={actions.handleNuevaReserva}
                />
              </div>
            );
          })}
        </div>
      </div>

      <Legend />

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
