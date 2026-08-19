"use client";

import {
  Alerta,
  BottomActionBar,
  OptionSelector,
  StepIndicator,
  SummaryPanel,
} from "@/components/shared";
import { Button, Card } from "@/components/ui";
import { formatearFechaExtensa } from "@/lib/formato";

import { PASOS_NUEVA_RESERVA, useEspecialista } from "./hooks";

export default function EspecialistaView() {
  const {
    fecha,
    hora,
    pacienteNombre,
    nombreServicio,
    especialistaId,
    especialistaNombre,
    especialistas,
    sinEspecialistasDisponibles,
    resolviendoBloques,
    errorResolucionBloques,
    isLoading,
    actions,
  } = useEspecialista();

  const opciones = especialistas.map(esp => ({
    id: String(esp.id),
    titulo: esp.nombre,
    icono: (
      <span className="flex h-7 w-7 items-center justify-center rounded-none bg-slate-100 text-xs font-bold font-sans text-slate-800">
        {esp.nombre
          .split(" ")
          .map(n => n[0])
          .join("")}
      </span>
    ),
  }));

  return (
    <div className="mx-auto max-w-5xl font-sans shadow-none">
      <div className="mb-6">
        <StepIndicator pasos={PASOS_NUEVA_RESERVA} pasoActivo={3} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_320px]">
        <Card className="border border-border p-6">
          <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900 mb-1">
            ¿Qué profesional atenderá?
          </h2>
          <p className="font-sans text-xs text-slate-500 mb-4">
            Selecciona la especialista asignada para la atención de{" "}
            {nombreServicio ?? "este servicio"}.
          </p>

          {isLoading ? (
            <p className="font-sans text-xs text-slate-400">
              Cargando especialistas...
            </p>
          ) : sinEspecialistasDisponibles ? (
            <Alerta tono="advertencia">
              Ningún especialista tiene disponible esa franja completa. Prueba
              con otro horario.
            </Alerta>
          ) : (
            <OptionSelector
              opciones={opciones}
              seleccionId={
                especialistaId !== null ? String(especialistaId) : null
              }
              onSeleccionar={actions.handleSeleccionar}
            />
          )}

          {errorResolucionBloques && (
            <Alerta tono="error" className="mt-4">
              Ese horario ya no está disponible para el especialista
              seleccionado. Elige otro especialista u otro horario.
            </Alerta>
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
              <Button
                disabled={
                  !especialistaId ||
                  resolviendoBloques ||
                  errorResolucionBloques
                }
                onClick={actions.handleContinuar}
              >
                {resolviendoBloques ? "Verificando..." : "Continuar"}
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
