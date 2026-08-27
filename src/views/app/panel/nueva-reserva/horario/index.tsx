"use client";

import { Suspense } from "react";

import {
  Alerta,
  BottomActionBar,
  StepIndicator,
  SummaryPanel,
} from "@/components/shared";
import { Button, Card } from "@/components/ui";
import { fechaISO, formatearFechaExtensa } from "@/lib/formato";

import { BloquesSelector } from "./components";
import { PASOS_NUEVA_RESERVA, useHorario } from "./hooks";

function HorarioContent() {
  const {
    hoy,
    fecha,
    horasSeleccionadas,
    duracionMin,
    horaInicio,
    horaTerminoCalculada,
    manana,
    tarde,
    duracionActiva,
    bloquesExigidos,
    servicioDuracionMinutos,
    nombreServicio,
    especialistaNombre,
    pacienteNombre,
    errorSeleccion,
    sinDisponibilidadEnFecha,
    isLoading,
    actions,
  } = useHorario();

  if (!hoy) return <div aria-hidden />;

  return (
    <div className="mx-auto max-w-5xl font-sans shadow-none">
      <div className="mb-6">
        <StepIndicator pasos={PASOS_NUEVA_RESERVA} pasoActivo={2} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_320px]">
        <Card className="border border-border p-6">
          <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
            ¿Cuándo será la atención?
          </h2>

          {errorSeleccion && (
            <Alerta tono="error" className="mb-4">
              {errorSeleccion}
            </Alerta>
          )}

          <div className="grid grid-cols-1 gap-6 divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="sm:pr-6 space-y-3">
              <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Seleccionar Fecha de Atención
              </label>
              <input
                type="date"
                value={fecha ? fechaISO(fecha) : ""}
                min={fechaISO(hoy)}
                onChange={e => actions.handleCambiarFecha(e.target.value)}
                className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none cursor-pointer"
              />
              {fecha && (
                <p className="font-sans text-xs text-slate-700 pt-1">
                  Fecha seleccionada:{" "}
                  <span className="font-medium text-slate-900">
                    {formatearFechaExtensa(fecha)}
                  </span>
                </p>
              )}

              {horaInicio && horaTerminoCalculada && (
                <p className="font-sans text-xs text-slate-700 pt-1">
                  Horario seleccionado:{" "}
                  <span className="font-medium text-slate-900">
                    {horaInicio} a {horaTerminoCalculada} hrs
                  </span>{" "}
                  ({duracionMin} minutos)
                </p>
              )}
              {duracionActiva && servicioDuracionMinutos && (
                <p className="font-sans text-xs text-slate-500 pt-1">
                  Este servicio requiere {servicioDuracionMinutos} min (
                  {bloquesExigidos} bloque(s) de 30 min).
                </p>
              )}
            </div>
            <div className="sm:pl-6">
              {!fecha ? (
                <p className="font-sans text-xs text-slate-400">
                  Selecciona primero una fecha para ver los horarios.
                </p>
              ) : isLoading ? (
                <p className="font-sans text-xs text-slate-400">
                  Cargando horarios disponibles...
                </p>
              ) : sinDisponibilidadEnFecha ? (
                <p className="font-sans text-xs text-slate-400">
                  Sin bloques disponibles para esta fecha. Prueba con otra.
                </p>
              ) : (
                <>
                  <p className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-2">
                    Mañana
                  </p>
                  <BloquesSelector
                    horas={manana}
                    horasSeleccionadas={horasSeleccionadas}
                    onSeleccionar={actions.handleSeleccionarHora}
                  />
                  <div className="my-4 border-t border-slate-200" />
                  <p className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-2">
                    Tarde
                  </p>
                  <BloquesSelector
                    horas={tarde}
                    horasSeleccionadas={horasSeleccionadas}
                    onSeleccionar={actions.handleSeleccionarHora}
                  />
                </>
              )}
            </div>
          </div>

          <BottomActionBar
            abandono={
              <button
                type="button"
                onClick={actions.handleCancelar}
                className="font-sans text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
              >
                Cancelar reserva
              </button>
            }
            volver={
              <Button variant="outline" onClick={actions.handleVolver}>
                Volver
              </Button>
            }
            avanzar={
              <Button
                disabled={
                  !fecha ||
                  horasSeleccionadas.length === 0 ||
                  (duracionActiva &&
                    horasSeleccionadas.length !== bloquesExigidos)
                }
                onClick={actions.handleContinuar}
              >
                Continuar
              </Button>
            }
          />
        </Card>

        <SummaryPanel
          filas={[
            { etiqueta: "Servicio", valor: nombreServicio },
            {
              etiqueta: "Duración",
              valor: duracionMin
                ? `${duracionMin} min (${horasSeleccionadas.length} bloques)`
                : undefined,
            },
            {
              etiqueta: "Fecha",
              valor: fecha ? formatearFechaExtensa(fecha) : undefined,
            },
            {
              etiqueta: "Horario",
              valor:
                horaInicio && horaTerminoCalculada
                  ? `${horaInicio} a ${horaTerminoCalculada}`
                  : horaInicio || undefined,
            },
            {
              etiqueta: "Especialista",
              valor: especialistaNombre || undefined,
            },
            { etiqueta: "Paciente", valor: pacienteNombre ?? undefined },
          ]}
        />
      </div>
    </div>
  );
}

export default function HorarioView() {
  return (
    <Suspense fallback={<div className="h-full" aria-hidden />}>
      <HorarioContent />
    </Suspense>
  );
}
