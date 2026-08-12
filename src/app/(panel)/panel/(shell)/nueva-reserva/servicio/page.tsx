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

const PASOS = [
  { etiqueta: "Servicio" },
  { etiqueta: "Horario" },
  { etiqueta: "Especialista" },
  { etiqueta: "Paciente" },
  { etiqueta: "Notas y resumen" },
];

export interface OpcionServicio {
  id: Servicio;
  titulo: string;
}

/** Catálogo oficial de servicios Hito 4 */
export const CATALAGO_SERVICIOS: OpcionServicio[] = [
  { id: "embarazadas", titulo: "Embarazadas" },
  { id: "masajes_pareja", titulo: "Masajes en pareja (masoterapia)" },
  { id: "masajes", titulo: "Masajes (masoterapia)" },
  { id: "masajes_premium", titulo: "Masajes Premium (masoterapia premium)" },
  { id: "masajes_reductivos", titulo: "Masajes Reductivos" },
  { id: "voucher_regalo", titulo: "Voucher para Regalo" },
  { id: "kinesiologia", titulo: "Kinesiología" },
];

export default function NuevaReservaServicioPage() {
  const router = useRouter();
  const { fecha, hora, pacienteNombre, especialistaNombre, servicio, setServicio } = useNuevaReservaStore();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <StepIndicator pasos={PASOS} pasoActivo={1} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_320px]">
        <Card>
          <h2 className="mb-1 text-lg font-bold text-panel-sidebar">¿Qué servicio se realizará?</h2>
          <p className="mb-4 text-xs font-medium text-brand-muted">
            Selecciona una opción del catálogo de atención oficial.
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            {CATALAGO_SERVICIOS.map((item) => {
              const seleccionado = servicio === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setServicio(item.id)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3.5 transition-all cursor-pointer ${
                    seleccionado
                      ? "border-panel-sidebar bg-panel-seleccion shadow-sm"
                      : "border-brand-border bg-white hover:border-panel-sidebar/40"
                  }`}
                >
                  <p className="font-bold text-sm text-panel-sidebar">{item.titulo}</p>

                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      seleccionado
                        ? "border-panel-sidebar bg-panel-sidebar text-white"
                        : "border-brand-border bg-white"
                    }`}
                  >
                    {seleccionado && (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

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
            avanzar={
              <Button variante="primario" disabled={!servicio} onClick={() => router.push("/panel/nueva-reserva/horario")}>
                Continuar
              </Button>
            }
          />
        </Card>

        <SummaryPanel
          filas={[
            { etiqueta: "Servicio", valor: servicio ? CATALAGO_SERVICIOS.find((s) => s.id === servicio)?.titulo : undefined },
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
