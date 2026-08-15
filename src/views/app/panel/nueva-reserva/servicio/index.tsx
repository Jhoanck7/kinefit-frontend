"use client";

import { BottomActionBar } from "@/components/panel/primitives/BottomActionBar";
import { StepIndicator } from "@/components/panel/primitives/StepIndicator";
import { SummaryPanel } from "@/components/panel/primitives/SummaryPanel";
import { Button, Card } from "@/components/ui";
import { formatearFechaExtensa } from "@/lib/panel/domain/formato";

import { ServicioOption } from "./components";
import { CATALOGO_SERVICIOS, PASOS_NUEVA_RESERVA, useServicio } from "./hooks";

export default function ServicioView() {
  const {
    fecha,
    hora,
    pacienteNombre,
    especialistaNombre,
    servicio,
    nombreServicio,
    actions,
  } = useServicio();

  return (
    <div className="mx-auto max-w-5xl font-sans shadow-none">
      <div className="mb-6">
        <StepIndicator pasos={PASOS_NUEVA_RESERVA} pasoActivo={1} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_320px]">
        <Card className="border border-border p-6">
          <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900 mb-1">
            ¿Qué servicio se realizará?
          </h2>
          <p className="font-sans text-xs text-slate-500 mb-4">
            Selecciona una opción del catálogo de atención oficial.
          </p>

          <div className="grid grid-cols-1 gap-2">
            {CATALOGO_SERVICIOS.map(item => (
              <ServicioOption
                key={item.id}
                titulo={item.titulo}
                seleccionado={servicio === item.id}
                onClick={() => actions.handleSeleccionar(item.id)}
              />
            ))}
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
            avanzar={
              <Button disabled={!servicio} onClick={actions.handleContinuar}>
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
