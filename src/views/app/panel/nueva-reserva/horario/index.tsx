"use client";

import { Suspense } from "react";

import { BottomActionBar } from "@/components/panel/primitives/BottomActionBar";
import { StepIndicator } from "@/components/panel/primitives/StepIndicator";
import { SummaryPanel } from "@/components/panel/primitives/SummaryPanel";
import { Button, Card } from "@/components/ui";
import { fechaISO, formatearFechaExtensa } from "@/lib/panel/domain/formato";

import { BloquesSelector } from "./components";
import { PASOS_NUEVA_RESERVA, useHorario } from "./hooks";

function HorarioContent() {
  const {
    hoy,
    fecha,
    hora,
    duracionMin,
    bloquesRequeridos,
    horaTerminoCalculada,
    manana,
    tarde,
    bloques,
    nombreServicio,
    especialistaNombre,
    pacienteNombre,
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

              {hora && horaTerminoCalculada && (
                <div className="border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 space-y-0.5 rounded-none">
                  <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Franja Horaria:
                  </p>
                  <p className="font-sans font-medium text-sm text-emerald-950">
                    {hora} a {horaTerminoCalculada} hrs
                  </p>
                  <p className="font-sans text-[11px] text-emerald-700">
                    ({duracionMin} minutos · {bloquesRequeridos} bloques de 30
                    min)
                  </p>
                </div>
              )}
            </div>
            <div className="sm:pl-6">
              {!fecha ? (
                <p className="font-sans text-xs text-slate-400">
                  Selecciona primero una fecha para ver los horarios.
                </p>
              ) : (
                <>
                  <p className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-2">
                    Mañana
                  </p>
                  <BloquesSelector
                    bloques={manana}
                    todosBloques={bloques}
                    bloquesRequeridos={bloquesRequeridos}
                    horaSeleccionada={hora}
                    onSeleccionar={actions.handleSeleccionarBloque}
                  />
                  <div className="my-4 border-t border-slate-200" />
                  <p className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-2">
                    Tarde
                  </p>
                  <BloquesSelector
                    bloques={tarde}
                    todosBloques={bloques}
                    bloquesRequeridos={bloquesRequeridos}
                    horaSeleccionada={hora}
                    onSeleccionar={actions.handleSeleccionarBloque}
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
                disabled={!fecha || !hora}
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
              valor: `${duracionMin} min (${bloquesRequeridos} bloques)`,
            },
            {
              etiqueta: "Fecha",
              valor: fecha ? formatearFechaExtensa(fecha) : undefined,
            },
            {
              etiqueta: "Horario",
              valor:
                hora && horaTerminoCalculada
                  ? `${hora} a ${horaTerminoCalculada}`
                  : hora || undefined,
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
