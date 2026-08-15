"use client";

import { useRouter } from "next/navigation";

import { BottomActionBar } from "@/components/panel/primitives/BottomActionBar";
import { Button } from "@/components/panel/primitives/Button";
import { Card } from "@/components/panel/primitives/Card";
import { OptionSelector } from "@/components/panel/primitives/OptionSelector";
import { StepIndicator } from "@/components/panel/primitives/StepIndicator";
import { SummaryPanel } from "@/components/panel/primitives/SummaryPanel";
import { ESPECIALISTAS } from "@/lib/panel/data/_seed/especialistas";
import { formatearFechaExtensa } from "@/lib/panel/domain/formato";
import { useNuevaReservaStore } from "@/lib/store/useNuevaReservaStore";

const PASOS = [
  { etiqueta: "Servicio" },
  { etiqueta: "Horario" },
  { etiqueta: "Especialista" },
  { etiqueta: "Paciente" },
  { etiqueta: "Notas y resumen" },
];

const NOMBRE_SERVICIO: Record<string, string> = {
  embarazadas: "Embarazadas",
  masajes_pareja: "Masajes en pareja",
  masajes: "Masajes (masoterapia)",
  masajes_premium: "Masajes Premium",
  masajes_reductivos: "Masajes Reductivos",
  voucher_regalo: "Voucher para Regalo",
  kinesiologia: "Kinesiología",
};

export default function NuevaReservaEspecialistaPage() {
  const router = useRouter();
  const {
    fecha,
    hora,
    pacienteNombre,
    servicio,
    especialistaId,
    especialistaNombre,
    setEspecialista,
  } = useNuevaReservaStore();

  const especialistasFiltradas = servicio
    ? ESPECIALISTAS.filter(e => e.servicios.includes(servicio))
    : ESPECIALISTAS;

  const opciones = especialistasFiltradas.map(esp => ({
    id: esp.id,
    titulo: `${esp.nombre} (${esp.cargo})`,
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
        <StepIndicator pasos={PASOS} pasoActivo={3} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_320px]">
        <Card className="rounded-none border-slate-200 shadow-none p-6">
          <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900 mb-1">
            ¿Qué profesional atenderá?
          </h2>
          <p className="font-sans text-xs text-slate-500 mb-4">
            Selecciona la especialista asignada para la atención de{" "}
            {servicio
              ? (NOMBRE_SERVICIO[servicio] ?? servicio)
              : "este servicio"}
            .
          </p>

          <OptionSelector
            opciones={opciones}
            seleccionId={especialistaId}
            onSeleccionar={id => {
              const esp = ESPECIALISTAS.find(e => e.id === id);
              if (esp) setEspecialista(esp.id, esp.nombre);
            }}
          />

          <BottomActionBar
            abandono={
              <button
                type="button"
                onClick={() => router.push("/panel/agenda")}
                className="font-sans text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
              >
                Cancelar reserva
              </button>
            }
            volver={
              <Button
                variante="secundario"
                onClick={() => router.push("/panel/nueva-reserva/horario")}
              >
                Volver
              </Button>
            }
            avanzar={
              <Button
                variante="primario"
                disabled={!especialistaId}
                onClick={() => router.push("/panel/nueva-reserva/paciente")}
              >
                Continuar
              </Button>
            }
          />
        </Card>

        <SummaryPanel
          filas={[
            {
              etiqueta: "Servicio",
              valor: servicio
                ? (NOMBRE_SERVICIO[servicio] ?? servicio)
                : undefined,
            },
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
