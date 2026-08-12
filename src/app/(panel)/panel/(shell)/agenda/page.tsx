"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useHoyPanel } from "@/lib/panel/reloj";
import { usePanelSessionStore, USUARIO_SESION_PANEL } from "@/lib/store/usePanelSessionStore";
import { generarRejillaDia } from "@/lib/panel/domain/horario";
import { diaSemanaId, fechaISO } from "@/lib/panel/domain/formato";
import { getAgendaDia, CitaResuelta, BloqueoResuelto } from "@/lib/panel/data/citas";
import { ESPECIALISTAS } from "@/lib/panel/data/_seed/especialistas";
import { Card } from "@/components/panel/primitives/Card";
import { Button } from "@/components/panel/primitives/Button";
import { TimeGrid } from "@/components/panel/domain/TimeGrid";
import { Legend } from "@/components/panel/domain/Legend";
import { AppointmentDetailModal } from "@/components/panel/domain/AppointmentDetailModal";
import { CancelAppointmentModal } from "@/components/panel/domain/CancelAppointmentModal";
import { GestionBloqueosModal } from "@/components/panel/domain/GestionBloqueosModal";

function AgendaContenido() {
  const hoy = useHoyPanel();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const usuario = usePanelSessionStore((s) => s.usuario) ?? USUARIO_SESION_PANEL;

  const [dia, setDia] = useState<Date | null>(null);
  const [especialistaSeleccionado, setEspecialistaSeleccionado] = useState<string>("todas");
  const [modalBloqueos, setModalBloqueos] = useState(false);

  // Datos por especialista para la vista comparativa de 3 columnas
  const [agendaData, setAgendaData] = useState<
    Record<string, { citas: CitaResuelta[]; bloqueos: BloqueoResuelto[] }>
  >({});

  const cargarAgenda = useCallback(() => {
    if (!dia || !hoy) return;

    Promise.all(
      ESPECIALISTAS.map(async (esp) => {
        const res = await getAgendaDia(esp.id, dia, hoy);
        return { espId: esp.id, data: res };
      })
    ).then((resultados) => {
      const mapa: Record<string, { citas: CitaResuelta[]; bloqueos: BloqueoResuelto[] }> = {};
      resultados.forEach((r) => {
        mapa[r.espId] = r.data;
      });
      setAgendaData(mapa);
    });
  }, [dia, hoy]);

  useEffect(() => {
    if (hoy && dia === null) {
      setDia(hoy);
    }
  }, [hoy, dia]);

  useEffect(() => {
    cargarAgenda();
  }, [cargarAgenda]);

  if (!hoy || !dia) {
    return <div className="h-full" aria-hidden />;
  }

  const esHoy = fechaISO(dia) === fechaISO(hoy);
  const rejilla = generarRejillaDia(diaSemanaId(dia) as 0 | 1 | 2 | 3 | 4 | 5 | 6);
  const horaActual = esHoy
    ? `${hoy.getHours().toString().padStart(2, "0")}:${hoy.getMinutes().toString().padStart(2, "0")}`
    : null;

  function irADia(offset: number) {
    const nuevo = new Date(dia!);
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

  // Determinar qué especialistas mostrar (Todas las 3 o 1 individual)
  const especialistasAMostrar =
    especialistaSeleccionado === "todas"
      ? ESPECIALISTAS
      : ESPECIALISTAS.filter((e) => e.id === especialistaSeleccionado);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Controles superiores: Navegación de Fecha + Selector Nativo de Calendario + Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Controles de Navegación por Día y Selector de Fecha Nativo (Navegador/Google) */}
        <div className="flex items-center gap-3">
          <div className="flex overflow-hidden rounded-lg border border-brand-border bg-white shadow-sm items-center">
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

          {/* Componente de Fecha Nativo con Selector de Calendario Google/Chrome */}
          <input
            type="date"
            value={fechaISO(dia)}
            onChange={(e) => {
              if (e.target.value) {
                setDia(new Date(`${e.target.value}T00:00:00`));
              }
            }}
            className="rounded-lg border border-brand-border bg-white px-3 py-1.5 text-sm font-bold text-panel-sidebar focus:border-panel-sidebar focus:outline-none cursor-pointer shadow-sm"
          />
        </div>

        {/* Filtro de Especialista y Botón de Gestión de Bloqueos */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-brand-muted text-sm">Vista Agenda:</span>
            <select
              value={especialistaSeleccionado}
              onChange={(e) => setEspecialistaSeleccionado(e.target.value)}
              className="rounded-lg border border-brand-border bg-white px-3 py-1.5 text-sm font-medium text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
            >
              <option value="todas">Todas</option>
              {ESPECIALISTAS.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.nombre} ({esp.cargo})
                </option>
              ))}
            </select>
          </div>

          <Button
            variante="secundario"
            onClick={() => setModalBloqueos(true)}
          >
            Gestión de Bloqueos
          </Button>
          <Button
            variante="primario"
            onClick={() => router.push(`/panel/nueva-reserva/horario?fecha=${fechaISO(dia)}`)}
          >
            Nueva reserva
          </Button>
        </div>
      </div>

      {/* Contenedor Único Consolidado */}
      <Card className="p-0 overflow-hidden space-y-0">
        {/* Encabezado Unificado con los Nombres de las Especialistas */}
        <div
          className={`grid border-b border-brand-border bg-panel-seleccion/40 ${
            especialistasAMostrar.length === 3 ? "grid-cols-[56px_1fr_1fr_1fr]" : "grid-cols-[56px_1fr]"
          }`}
        >
          <div className="border-r border-brand-border p-3" aria-hidden />
          {especialistasAMostrar.map((esp, idx) => (
            <div
              key={esp.id}
              className={`p-3 text-center ${
                idx > 0 ? "border-l border-brand-border" : ""
              }`}
            >
              <p className="font-bold text-panel-sidebar text-sm">{esp.nombre}</p>
              <p className="text-xs font-medium text-brand-muted">{esp.cargo}</p>
            </div>
          ))}
        </div>

        {/* Rejilla Única Pegada Dividida por Líneas Verticales Finas */}
        <div
          className={`grid ${
            especialistasAMostrar.length === 3 ? "grid-cols-[56px_1fr_1fr_1fr]" : "grid-cols-[56px_1fr]"
          }`}
        >
          {/* Columna de Horas (09:00, 10:00...) a la izquierda */}
          <div className="w-14 border-r border-brand-border">
            {rejilla.map((bloque) => (
              <div
                key={bloque.inicio}
                style={{ height: 56 }}
                className="flex items-start justify-end pr-2 pt-1 text-[11px] text-brand-muted font-medium border-b border-brand-border/60"
              >
                {bloque.inicio}
              </div>
            ))}
          </div>

          {/* Columnas de los Especialistas Pegadas Separadas por Línea Vertical */}
          <div
            className={`col-span-${especialistasAMostrar.length} grid ${
              especialistasAMostrar.length === 3 ? "grid-cols-3 divide-x divide-brand-border" : "grid-cols-1"
            }`}
          >
            {especialistasAMostrar.map((esp) => {
              const dataEsp = agendaData[esp.id] ?? { citas: [], bloqueos: [] };
              const { citas, bloqueos } = dataEsp;

              return (
                <div key={esp.id} className="w-full">
                  <TimeGrid
                    rejilla={rejilla}
                    citas={citas}
                    bloqueos={bloqueos}
                    horaActual={horaActual}
                    ocultarHoras={true}
                    onSeleccionarCita={(id) => abrirParametros({ cita: id })}
                    onSeleccionarBloqueVacio={(hora) =>
                      router.push(`/panel/nueva-reserva/horario?fecha=${fechaISO(dia)}&hora=${hora}`)
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Card className="py-3 px-4">
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

      <GestionBloqueosModal
        abierto={modalBloqueos}
        onClose={() => setModalBloqueos(false)}
        onBloqueoCreado={cargarAgenda}
      />
    </div>
  );
}

export default function AgendaPage() {
  return (
    <Suspense fallback={<div className="h-full" aria-hidden />}>
      <AgendaContenido />
    </Suspense>
  );
}
