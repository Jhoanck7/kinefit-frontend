"use client";

import {
  BottomActionBar,
  SearchInput,
  StepIndicator,
  SummaryPanel,
} from "@/components/shared";
import { Button, Card } from "@/components/ui";
import { formatearFechaExtensa } from "@/lib/formato";

import { PASOS_NUEVA_RESERVA, usePacienteReserva } from "./hooks";

export default function PacienteView() {
  const {
    fecha,
    hora,
    pacienteId,
    pacienteNombre,
    especialistaNombre,
    nombreServicio,
    busqueda,
    resultados,
    buscado,
    pacienteConfirmado,
    actions,
  } = usePacienteReserva();

  return (
    <div className="mx-auto max-w-5xl font-sans shadow-none">
      <div className="mb-6">
        <StepIndicator pasos={PASOS_NUEVA_RESERVA} pasoActivo={4} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_320px]">
        <Card className="border border-border p-6">
          <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
            ¿Para quién es la cita?
          </h2>

          {pacienteId ? (
            <div className="border border-slate-200 bg-slate-50/60 p-4 rounded-none space-y-1.5">
              <p className="font-sans font-medium text-sm text-slate-900">
                {pacienteNombre}
              </p>
              {pacienteConfirmado && (
                <div className="space-y-0.5 text-xs text-slate-600">
                  <p>
                    RUT:{" "}
                    <span className="text-slate-900 font-medium">
                      {pacienteConfirmado.rut}
                    </span>
                  </p>
                  <p>{pacienteConfirmado.telefono}</p>
                  <p>{pacienteConfirmado.email}</p>
                  <p>
                    Convenio:{" "}
                    <span className="text-slate-900 font-medium">
                      {pacienteConfirmado.convenio ?? "Sin Convenio"}
                    </span>
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={actions.handleCambiarPaciente}
                className="pt-2 font-sans text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-950 underline block"
              >
                Cambiar paciente
              </button>
            </div>
          ) : (
            <>
              <SearchInput
                placeholder="Buscar por nombre o RUT..."
                value={busqueda}
                onChange={actions.handleBusquedaChange}
                ayuda="Buscar por nombre o RUT…"
              />

              {buscado && (
                <div className="mt-4">
                  <p className="mb-2 font-sans text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    Resultados de búsqueda
                  </p>
                  {resultados.length === 0 ? (
                    <p className="font-sans text-xs text-slate-400">
                      No se encontraron pacientes que coincidan con la búsqueda.
                      Puedes registrar uno nuevo.
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-200 border border-slate-200 rounded-none bg-white">
                      {resultados.map(paciente => (
                        <li key={paciente.id}>
                          <button
                            type="button"
                            onClick={() => actions.handleSeleccionar(paciente)}
                            className="flex w-full items-center justify-between px-4 py-2.5 text-left font-sans text-xs hover:bg-slate-50 focus-visible:outline-none"
                          >
                            <span className="font-medium text-slate-900">
                              {paciente.nombre} {paciente.apellido}
                            </span>
                            <span className="text-slate-500">
                              {paciente.rut} ›
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="my-4 flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-slate-200" />
                <span className="font-sans text-[11px] text-slate-400">o</span>
                <div className="h-[1px] flex-1 bg-slate-200" />
              </div>

              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={actions.handleRegistrarNuevo}
              >
                Registrar paciente nuevo
              </Button>
            </>
          )}

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
              <Button disabled={!pacienteId} onClick={actions.handleContinuar}>
                Continuar
              </Button>
            }
          />
        </Card>

        <SummaryPanel
          filas={[
            { etiqueta: "Servicio", valor: nombreServicio },
            {
              etiqueta: "Fecha",
              valor: fecha ? formatearFechaExtensa(fecha) : undefined,
            },
            { etiqueta: "Horario", valor: hora || undefined },
            {
              etiqueta: "Especialista",
              valor: especialistaNombre || undefined,
            },
            { etiqueta: "Paciente", valor: pacienteNombre || undefined },
          ]}
        />
      </div>
    </div>
  );
}
