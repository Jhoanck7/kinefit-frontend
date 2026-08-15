"use client";

import { BottomActionBar } from "@/components/panel/primitives/BottomActionBar";
import { SearchInput } from "@/components/panel/primitives/CamposFormulario";
import { EmptyState } from "@/components/panel/primitives/EmptyState";
import { StepIndicator } from "@/components/panel/primitives/StepIndicator";
import { SummaryPanel } from "@/components/panel/primitives/SummaryPanel";
import { Button, Card } from "@/components/ui";
import {
  formatearFechaExtensa,
  formatearRangoHorario,
} from "@/lib/panel/domain/formato";

import { useNuevaFichaReserva } from "./hooks";

export default function NuevaFichaReservaView() {
  const {
    pacienteId,
    pacienteNombre,
    citaId,
    busqueda,
    resultados,
    reservas,
    cambiandoEstadoId,
    citaSeleccionada,
    actions,
  } = useNuevaFichaReserva();

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-[1fr_320px] font-sans shadow-none">
      <div className="sm:col-span-2">
        <StepIndicator
          pasos={[{ etiqueta: "Reserva" }, { etiqueta: "Ficha" }]}
          pasoActivo={1}
        />
      </div>

      <Card className="border border-border p-6">
        <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900 mb-1">
          ¿A qué atención corresponde la ficha?
        </h2>
        <p className="font-sans text-xs text-slate-500 mb-4">
          Busque al paciente y seleccione la reserva asociada.
        </p>

        <SearchInput
          placeholder="Buscar por nombre o RUT..."
          value={busqueda}
          onChange={actions.setBusqueda}
        />

        {resultados.length > 0 && (
          <ul className="mt-2 divide-y divide-slate-200 border border-slate-200 rounded-none bg-white">
            {resultados.map(paciente => (
              <li key={paciente.id}>
                <button
                  type="button"
                  onClick={() => actions.handleSeleccionarPaciente(paciente)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left font-sans text-sm hover:bg-slate-50 focus-visible:outline-none"
                >
                  <span className="font-medium text-slate-900">
                    {paciente.nombre} {paciente.apellido}
                  </span>
                  <span className="text-xs text-slate-500">{paciente.rut}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {pacienteId && (
          <div className="mt-6">
            <p className="mb-3 font-sans text-[11px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-1">
              Reservas de {pacienteNombre}
            </p>
            {reservas.length === 0 ? (
              <EmptyState
                titulo="Sin reservas"
                descripcion="Este paciente no tiene reservas registradas."
              />
            ) : (
              <ul className="space-y-2">
                {reservas.map(cita => {
                  const seleccionada = cita.id === citaId;
                  const esAtendida = cita.estado === "atendida";
                  const deshabilitada = cita.conFicha || !esAtendida;

                  return (
                    <li key={cita.id} className="space-y-1">
                      <button
                        type="button"
                        disabled={deshabilitada}
                        onClick={() => actions.handleSeleccionarReserva(cita)}
                        title={
                          cita.conFicha
                            ? "Esta reserva ya tiene una ficha asociada"
                            : !esAtendida
                              ? "La cita debe estar en estado 'Atendida' para asociar una ficha clínica"
                              : undefined
                        }
                        className={`flex w-full items-center justify-between gap-3 border p-3 text-left transition-colors rounded-none ${
                          seleccionada
                            ? "border-blue-900 bg-blue-50/90 text-blue-950"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-900"
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        <div>
                          <p className="font-sans font-medium text-sm text-slate-900">
                            {formatearFechaExtensa(cita.fecha)} ·{" "}
                            {formatearRangoHorario(
                              cita.horaInicio,
                              cita.horaTermino
                            )}
                          </p>
                          <p className="font-sans text-xs text-slate-500 capitalize mt-0.5">
                            {cita.servicio} · {cita.especialista.nombre}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 border px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider rounded-none ${
                            cita.conFicha
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : esAtendida
                                ? "border-blue-200 bg-blue-50 text-blue-800"
                                : "border-amber-200 bg-amber-50 text-amber-800"
                          }`}
                        >
                          {cita.conFicha
                            ? "Con ficha"
                            : esAtendida
                              ? "Atendida (Lista para ficha)"
                              : `Estado: ${cita.estado}`}
                        </span>
                      </button>

                      {cita.conFicha && cita.fichaId && (
                        <button
                          type="button"
                          onClick={() =>
                            actions.handleAbrirFichaExistente(cita.fichaId!)
                          }
                          className="mt-1 font-sans text-xs text-slate-700 hover:text-slate-950 underline underline-offset-2 block"
                        >
                          Abrir la ficha existente
                        </button>
                      )}

                      {!esAtendida && !cita.conFicha && (
                        <div className="flex flex-wrap items-center justify-between gap-2 border border-amber-200 bg-amber-50 p-2.5 font-sans text-xs text-amber-900 rounded-none">
                          <span>
                            Esta cita está en estado{" "}
                            <strong>&ldquo;{cita.estado}&rdquo;</strong>. Debe
                            estar marcada como <strong>Atendida</strong> para
                            poder asociarle una ficha.
                          </span>
                          <Button
                            variant="outline"
                            disabled={cambiandoEstadoId === cita.id}
                            onClick={() =>
                              actions.handleMarcarComoAtendida(cita.id)
                            }
                          >
                            {cambiandoEstadoId === cita.id
                              ? "Actualizando..."
                              : "Marcar como Atendida"}
                          </Button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        <BottomActionBar
          abandono={
            <button
              type="button"
              onClick={actions.handleCancelar}
              className="font-sans text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
          }
          avanzar={
            <Button
              disabled={
                !citaSeleccionada || citaSeleccionada.estado !== "atendida"
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
          { etiqueta: "PACIENTE", valor: pacienteNombre ?? undefined },
          {
            etiqueta: "RESERVA",
            valor: citaSeleccionada
              ? `${formatearFechaExtensa(citaSeleccionada.fecha)} · ${formatearRangoHorario(citaSeleccionada.horaInicio, citaSeleccionada.horaTermino)}`
              : undefined,
          },
          { etiqueta: "TIPO DE FICHA", valor: undefined },
        ]}
      />
    </div>
  );
}
