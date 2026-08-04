"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useHoyPanel } from "@/lib/panel/reloj";
import { usePanelSessionStore, USUARIO_SESION_PANEL } from "@/lib/store/usePanelSessionStore";
import { generarRejillaDia } from "@/lib/panel/domain/horario";
import { diaSemanaId, fechaISO, formatearFechaExtensa } from "@/lib/panel/domain/formato";
import { getAgendaDia, CitaResuelta, BloqueoResuelto } from "@/lib/panel/data/citas";
import { Card } from "@/components/panel/primitives/Card";
import { Button } from "@/components/panel/primitives/Button";
import { EmptyState } from "@/components/panel/primitives/EmptyState";
import { OutOfScopeInlineLink } from "@/components/panel/primitives/OutOfScope";
import { TimeGrid } from "@/components/panel/domain/TimeGrid";
import { Legend } from "@/components/panel/domain/Legend";
import { AppointmentDetailModal } from "@/components/panel/domain/AppointmentDetailModal";
import { CancelAppointmentModal } from "@/components/panel/domain/CancelAppointmentModal";

function AgendaContent() {
  const hoy = useHoyPanel();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const usuario = usePanelSessionStore((s) => s.usuario) ?? USUARIO_SESION_PANEL;

  const [dia, setDia] = useState<Date | null>(hoy);
  const [citas, setCitas] = useState<CitaResuelta[]>([]);
  const [bloqueos, setBloqueos] = useState<BloqueoResuelto[]>([]);

  const diaEfectivo = dia ?? hoy;

  useEffect(() => {
    if (!diaEfectivo || !hoy) return;
    const especialistaId = usuario.especialistaId ?? "esp-franchesca";
    getAgendaDia(especialistaId, diaEfectivo, hoy).then((resultado) => {
      setCitas(resultado.citas);
      setBloqueos(resultado.bloqueos);
    });
  }, [diaEfectivo, hoy, usuario.especialistaId]);

  if (!hoy || !diaEfectivo) {
    return <div className="h-full" aria-hidden />;
  }

  const esHoy = fechaISO(diaEfectivo) === fechaISO(hoy);
  const rejilla = generarRejillaDia(diaSemanaId(diaEfectivo) as 0 | 1 | 2 | 3 | 4 | 5 | 6);
  const horaActual = esHoy
    ? `${hoy.getHours().toString().padStart(2, "0")}:${hoy.getMinutes().toString().padStart(2, "0")}`
    : null;

  function irADia(offset: number) {
    const nuevo = new Date(diaEfectivo!);
    nuevo.setDate(nuevo.getDate() + offset);
    setDia(nuevo);
  }

  function irAHoy() {
    setDia(hoy);
  }

  function abrirParametros(params: Record<string, string | undefined>) {
    const actuales = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([clave, valor]) => {
      if (valor === undefined) actuales.delete(clave);
      else actuales.set(clave, valor);
    });
    const query = actuales.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const citaId = searchParams.get("cita");
  const cancelando = searchParams.get("cancelar") === "1";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex overflow-hidden rounded-lg border border-brand-border">
            <button
              type="button"
              onClick={() => irADia(-1)}
              aria-label="Día anterior"
              className="px-3 py-1.5 text-panel-sidebar hover:bg-panel-fondo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={irAHoy}
              className="border-x border-brand-border px-3 py-1.5 text-sm font-medium text-panel-sidebar hover:bg-panel-fondo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => irADia(1)}
              aria-label="Día siguiente"
              className="px-3 py-1.5 text-panel-sidebar hover:bg-panel-fondo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
            >
              ›
            </button>
          </div>
          <p className="font-bold text-panel-sidebar">{formatearFechaExtensa(diaEfectivo)}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/panel/agenda/bloqueos")}
            className="text-sm text-panel-sidebar underline underline-offset-2"
          >
            Bloqueos
          </button>
          <button
            type="button"
            onClick={() => router.push("/panel/horarios")}
            className="text-sm text-panel-sidebar underline underline-offset-2"
          >
            Horarios
          </button>
          <OutOfScopeInlineLink etiqueta="Filtros" />
          <Button variante="primario" onClick={() => router.push(`/panel/nueva-reserva/horario?fecha=${fechaISO(diaEfectivo)}`)}>
            + Nueva reserva
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="border-b border-brand-border py-4 text-center">
          <p className="font-bold text-panel-sidebar">Mi Agenda - {usuario.nombre}</p>
          <p className="text-sm text-brand-muted">{usuario.cargo}</p>
        </div>

        {citas.length === 0 && bloqueos.length === 0 ? (
          <EmptyState titulo="Sin citas este día" descripcion="No hay citas ni bloqueos agendados para la fecha seleccionada." />
        ) : (
          <TimeGrid
            rejilla={rejilla}
            citas={citas}
            bloqueos={bloqueos}
            horaActual={horaActual}
            onSeleccionarCita={(id) => abrirParametros({ cita: id })}
            onSeleccionarBloqueVacio={(hora) =>
              router.push(`/panel/nueva-reserva/horario?fecha=${fechaISO(diaEfectivo)}&hora=${hora}`)
            }
          />
        )}

        <Legend />
      </Card>

      <AppointmentDetailModal
        citaId={citaId}
        hoy={hoy}
        onCerrar={() => abrirParametros({ cita: undefined, cancelar: undefined })}
        onSolicitarCancelacion={() => abrirParametros({ cancelar: "1" })}
      />

      <CancelAppointmentModal
        citaId={citaId}
        hoy={hoy}
        abierto={Boolean(citaId) && cancelando}
        onVolver={() => abrirParametros({ cancelar: undefined })}
        onConfirmado={() => abrirParametros({ cita: undefined, cancelar: undefined })}
      />
    </div>
  );
}

export default function AgendaPage() {
  return (
    <Suspense fallback={<div className="h-full" aria-hidden />}>
      <AgendaContent />
    </Suspense>
  );
}
