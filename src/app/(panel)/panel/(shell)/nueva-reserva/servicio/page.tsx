"use client";

import { useRouter } from "next/navigation";

import { BottomActionBar } from "@/components/panel/primitives/BottomActionBar";
import { Button } from "@/components/panel/primitives/Button";
import { Card } from "@/components/panel/primitives/Card";
import { StepIndicator } from "@/components/panel/primitives/StepIndicator";
import { SummaryPanel } from "@/components/panel/primitives/SummaryPanel";
import { formatearFechaExtensa } from "@/lib/panel/domain/formato";
import { Servicio } from "@/lib/panel/domain/tipos";
import { useNuevaReservaStore } from "@/lib/store/useNuevaReservaStore";

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

/** Catálogo oficial de servicios */
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
  const {
    fecha,
    hora,
    pacienteNombre,
    especialistaNombre,
    servicio,
    setServicio,
  } = useNuevaReservaStore();

  return (
    <div className="mx-auto max-w-5xl font-sans shadow-none">
      <div className="mb-6">
        <StepIndicator pasos={PASOS} pasoActivo={1} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_320px]">
        <Card className="rounded-none border-slate-200 shadow-none p-6">
          <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900 mb-1">
            ¿Qué servicio se realizará?
          </h2>
          <p className="font-sans text-xs text-slate-500 mb-4">
            Selecciona una opción del catálogo de atención oficial.
          </p>

          <div className="grid grid-cols-1 gap-2">
            {CATALAGO_SERVICIOS.map(item => {
              const seleccionado = servicio === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setServicio(item.id)}
                  className={`flex items-center justify-between rounded-none border px-4 py-3 transition-colors cursor-pointer ${
                    seleccionado
                      ? "border-[#003366] bg-blue-50/80 text-blue-950"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-900"
                  }`}
                >
                  <p className="font-sans font-medium text-sm">{item.titulo}</p>

                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-none border ${
                      seleccionado
                        ? "border-[#003366] bg-[#003366] text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {seleccionado && (
                      <span className="text-[10px] font-bold">✓</span>
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
                className="font-sans text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
              >
                Cancelar reserva
              </button>
            }
            avanzar={
              <Button
                variante="primario"
                disabled={!servicio}
                onClick={() => router.push("/panel/nueva-reserva/horario")}
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
                ? CATALAGO_SERVICIOS.find(s => s.id === servicio)?.titulo
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
