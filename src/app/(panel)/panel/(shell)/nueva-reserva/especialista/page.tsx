"use client";

import { useRouter } from "next/navigation";
import { useNuevaReservaStore } from "@/lib/store/useNuevaReservaStore";
import { ESPECIALISTAS } from "@/lib/panel/data/_seed/especialistas";
import { formatearFechaExtensa } from "@/lib/panel/domain/formato";
import { Card } from "@/components/panel/primitives/Card";
import { Button } from "@/components/panel/primitives/Button";
import { SummaryPanel } from "@/components/panel/primitives/SummaryPanel";
import { StepIndicator } from "@/components/panel/primitives/StepIndicator";
import { BottomActionBar } from "@/components/panel/primitives/BottomActionBar";
import { OptionSelector } from "@/components/panel/primitives/OptionSelector";

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
  const { fecha, hora, pacienteNombre, servicio, especialistaId, especialistaNombre, setEspecialista } =
    useNuevaReservaStore();

  // Filtrar profesionales que realizan el servicio elegido (o todas si no hay servicio seleccionado)
  const especialistasFiltradas = servicio
    ? ESPECIALISTAS.filter((e) => e.servicios.includes(servicio))
    : ESPECIALISTAS;

  const opciones = especialistasFiltradas.map((esp) => ({
    id: esp.id,
    titulo: esp.nombre,
    descripcion: esp.cargo,
    icono: (
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-panel-seleccion text-sm font-bold text-panel-sidebar">
        {esp.nombre
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </span>
    ),
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <StepIndicator pasos={PASOS} pasoActivo={3} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_320px]">
        <Card>
          <h2 className="mb-4 text-lg font-bold text-panel-sidebar">¿Qué profesional atenderá?</h2>
          <p className="mb-4 text-sm text-brand-muted">
            Selecciona la especialista asignada para la atención de {servicio ? (NOMBRE_SERVICIO[servicio] ?? servicio) : "este servicio"}.
          </p>

          <OptionSelector
            opciones={opciones}
            seleccionId={especialistaId}
            onSeleccionar={(id) => {
              const esp = ESPECIALISTAS.find((e) => e.id === id);
              if (esp) setEspecialista(esp.id, esp.nombre);
            }}
          />

          <BottomActionBar
            abandono={
              <button
                type="button"
                onClick={() => router.push("/panel/agenda")}
                className="text-sm text-panel-sidebar underline underline-offset-2"
              >
                Cancelar reserva
              </button>
            }
            volver={
              <Button variante="secundario" onClick={() => router.push("/panel/nueva-reserva/horario")}>
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
            { etiqueta: "Servicio", valor: servicio ? (NOMBRE_SERVICIO[servicio] ?? servicio) : undefined },
            { etiqueta: "Fecha", valor: fecha ? formatearFechaExtensa(fecha) : undefined },
            { etiqueta: "Horario", valor: hora || undefined },
            { etiqueta: "Especialista", valor: especialistaNombre || undefined },
            { etiqueta: "Paciente", valor: pacienteNombre || undefined },
          ]}
        />
      </div>
    </div>
  );
}
