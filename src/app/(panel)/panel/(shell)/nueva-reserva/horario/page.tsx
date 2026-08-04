"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useHoyPanel } from "@/lib/panel/reloj";
import { usePanelSessionStore, USUARIO_SESION_PANEL } from "@/lib/store/usePanelSessionStore";
import { useNuevaReservaStore } from "@/lib/store/useNuevaReservaStore";
import { getAgendaDia } from "@/lib/panel/data/citas";
import { getPaciente } from "@/lib/panel/data/pacientes";
import { generarRejillaDia } from "@/lib/panel/domain/horario";
import { diaSemanaId, formatearFechaExtensa, formatearRangoHorario } from "@/lib/panel/domain/formato";
import { Card } from "@/components/panel/primitives/Card";
import { Button } from "@/components/panel/primitives/Button";
import { SummaryPanel } from "@/components/panel/primitives/SummaryPanel";
import { StepIndicator } from "@/components/panel/primitives/StepIndicator";
import { BottomActionBar } from "@/components/panel/primitives/BottomActionBar";
import { MonthCalendar } from "@/components/panel/domain/MonthCalendar";

const PASOS = [{ etiqueta: "Horario" }, { etiqueta: "Paciente" }, { etiqueta: "Servicio" }, { etiqueta: "Notas y resumen" }];

type EstadoBloque = "libre" | "ocupado" | "bloqueado";

function NuevaReservaHorarioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hoy = useHoyPanel();
  const usuario = usePanelSessionStore((s) => s.usuario) ?? USUARIO_SESION_PANEL;
  const { fecha, hora, pacienteNombre, setHorario, setPaciente } = useNuevaReservaStore();

  const [mesVisibleState, setMesVisible] = useState<Date | null>(null);
  const mesVisible = mesVisibleState ?? (hoy ? new Date(hoy.getFullYear(), hoy.getMonth(), 1) : null);

  const [bloques, setBloques] = useState<{ inicio: string; termino: string; estado: EstadoBloque; motivo?: string }[]>([]);

  useEffect(() => {
    if (!hoy) return;

    const fechaParam = searchParams.get("fecha");
    const horaParam = searchParams.get("hora");
    const pacienteIdParam = searchParams.get("pacienteId");
    if (fechaParam && !fecha) {
      const [y, m, d] = fechaParam.split("-").map(Number);
      const fechaResuelta = new Date(y, m - 1, d);
      setHorario(fechaResuelta, horaParam ?? "");
    }
    if (pacienteIdParam) {
      getPaciente(pacienteIdParam).then((p) => {
        if (p) setPaciente(p.id, `${p.nombre} ${p.apellido}`);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoy]);

  useEffect(() => {
    if (!fecha || !hoy) {
      return;
    }
    const especialistaId = usuario.especialistaId ?? "esp-franchesca";
    getAgendaDia(especialistaId, fecha, hoy).then(({ citas, bloqueos: bloqueosDelDia }) => {
      const rejilla = generarRejillaDia(diaSemanaId(fecha) as 0 | 1 | 2 | 3 | 4 | 5 | 6);
      const resultado = rejilla.map((bloque) => {
        const cita = citas.find((c) => c.horaInicio === bloque.inicio);
        if (cita) return { ...bloque, estado: "ocupado" as const };
        const bloqueo = bloqueosDelDia.find(
          (b) => bloque.inicio >= b.horaInicio && bloque.termino <= b.horaTermino
        );
        if (bloqueo) return { ...bloque, estado: "bloqueado" as const, motivo: bloqueo.motivo };
        return { ...bloque, estado: "libre" as const };
      });
      setBloques(resultado);
    });
  }, [fecha, hoy, usuario.especialistaId]);

  if (!hoy || !mesVisible) return <div aria-hidden />;

  const manana = bloques.filter((b) => b.inicio < "14:00");
  const tarde = bloques.filter((b) => b.inicio >= "15:00");

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <StepIndicator pasos={PASOS} pasoActivo={1} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_320px]">
        <Card>
          <h2 className="mb-4 text-lg font-bold text-panel-sidebar">¿Cuándo será la atención?</h2>
          <div className="grid grid-cols-1 gap-6 divide-y divide-brand-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="sm:pr-6">
              <MonthCalendar
                mesVisible={mesVisible}
                fechaSeleccionada={fecha}
                hoy={hoy}
                onSeleccionarFecha={(d) => setHorario(d, "")}
                onCambiarMes={(delta) => setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() + delta, 1))}
              />
            </div>
            <div className="sm:pl-6">
              {!fecha ? (
                <p className="text-sm text-brand-muted">Selecciona primero una fecha en el calendario.</p>
              ) : (
                <>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-muted">Mañana</p>
                  <BloquesChip bloques={manana} horaSeleccionada={hora} onSeleccionar={(h) => setHorario(fecha, h)} />
                  <div className="my-4 border-t border-brand-border" />
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-muted">Tarde</p>
                  <BloquesChip bloques={tarde} horaSeleccionada={hora} onSeleccionar={(h) => setHorario(fecha, h)} />
                </>
              )}
            </div>
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
              <Button
                variante="primario"
                disabled={!fecha || !hora}
                onClick={() => router.push("/panel/nueva-reserva/paciente")}
              >
                Continuar
              </Button>
            }
          />
        </Card>

        <SummaryPanel
          filas={[
            { etiqueta: "Fecha", valor: fecha ? formatearFechaExtensa(fecha) : undefined },
            { etiqueta: "Horario", valor: hora || undefined },
            { etiqueta: "Paciente", valor: pacienteNombre ?? undefined },
            { etiqueta: "Servicio", valor: undefined },
          ]}
        />
      </div>
    </div>
  );
}

function BloquesChip({
  bloques,
  horaSeleccionada,
  onSeleccionar,
}: {
  bloques: { inicio: string; termino: string; estado: EstadoBloque; motivo?: string }[];
  horaSeleccionada: string | null;
  onSeleccionar: (hora: string) => void;
}) {
  if (bloques.length === 0) return <p className="text-sm text-brand-muted">Sin bloques en este tramo.</p>;
  return (
    <div className="grid grid-cols-2 gap-2">
      {bloques.map((bloque) => {
        const seleccionado = bloque.inicio === horaSeleccionada;
        const noDisponible = bloque.estado !== "libre";
        return (
          <button
            key={bloque.inicio}
            type="button"
            disabled={noDisponible}
            title={bloque.estado === "ocupado" ? "Bloque ocupado" : bloque.estado === "bloqueado" ? bloque.motivo : undefined}
            onClick={() => onSeleccionar(bloque.inicio)}
            className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar ${
              seleccionado
                ? "border-panel-sidebar bg-panel-sidebar text-white"
                : noDisponible
                  ? "border-brand-border text-brand-border line-through"
                  : "border-brand-border text-panel-sidebar hover:border-panel-sidebar/40"
            }`}
          >
            {formatearRangoHorario(bloque.inicio, bloque.termino)}
            {seleccionado && (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function NuevaReservaHorarioPage() {
  return (
    <Suspense fallback={<div className="h-full" aria-hidden />}>
      <NuevaReservaHorarioContent />
    </Suspense>
  );
}
