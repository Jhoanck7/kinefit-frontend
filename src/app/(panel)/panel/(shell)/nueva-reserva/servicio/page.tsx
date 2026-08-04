"use client";

import { useRouter } from "next/navigation";
import { useNuevaReservaStore } from "@/lib/store/useNuevaReservaStore";
import { Servicio } from "@/lib/panel/domain/tipos";
import { formatearFechaExtensa } from "@/lib/panel/domain/formato";
import { Card } from "@/components/panel/primitives/Card";
import { Button } from "@/components/panel/primitives/Button";
import { SummaryPanel } from "@/components/panel/primitives/SummaryPanel";
import { StepIndicator } from "@/components/panel/primitives/StepIndicator";
import { BottomActionBar } from "@/components/panel/primitives/BottomActionBar";
import { OptionSelector } from "@/components/panel/primitives/OptionSelector";

const PASOS = [{ etiqueta: "Horario" }, { etiqueta: "Paciente" }, { etiqueta: "Servicio" }, { etiqueta: "Notas y resumen" }];

/** Masoterapia primero, luego Kinesiología (P3-1). */
const OPCIONES = [
  {
    id: "masoterapia" as Servicio,
    titulo: "Masoterapia",
    icono: (
      <svg className="h-6 w-6 text-panel-sidebar" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4-3-8-6.5-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 4.5-4 8-8 11z" />
      </svg>
    ),
  },
  {
    id: "kinesiologia" as Servicio,
    titulo: "Kinesiología",
    icono: (
      <svg className="h-6 w-6 text-panel-sidebar" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0" />
      </svg>
    ),
  },
];

export default function NuevaReservaServicioPage() {
  const router = useRouter();
  const { fecha, hora, pacienteNombre, servicio, setServicio } = useNuevaReservaStore();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <StepIndicator pasos={PASOS} pasoActivo={3} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_320px]">
        <Card>
          <h2 className="mb-4 text-lg font-bold text-panel-sidebar">¿Qué servicio se realizará?</h2>
          <OptionSelector opciones={OPCIONES} seleccionId={servicio} onSeleccionar={(id) => setServicio(id as Servicio)} />

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
              <Button variante="secundario" onClick={() => router.push("/panel/nueva-reserva/paciente")}>
                Volver
              </Button>
            }
            avanzar={
              <Button variante="primario" disabled={!servicio} onClick={() => router.push("/panel/nueva-reserva/resumen")}>
                Continuar
              </Button>
            }
          />
        </Card>

        <SummaryPanel
          filas={[
            { etiqueta: "Fecha", valor: fecha ? formatearFechaExtensa(fecha) : undefined },
            { etiqueta: "Horario", valor: hora || undefined },
            { etiqueta: "Paciente", valor: pacienteNombre || undefined },
            { etiqueta: "Servicio", valor: servicio ? OPCIONES.find((o) => o.id === servicio)?.titulo : undefined },
          ]}
        />
      </div>
    </div>
  );
}
