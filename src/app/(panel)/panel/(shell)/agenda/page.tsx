"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useHoyPanel } from "@/lib/panel/reloj";
import { usePanelSessionStore, USUARIO_SESION_PANEL } from "@/lib/store/usePanelSessionStore";
import { generarRejillaDia } from "@/lib/panel/domain/horario";
import { diaSemanaId, fechaISO } from "@/lib/panel/domain/formato";
import { getAgendaDia, CitaResuelta, BloqueoResuelto } from "@/lib/panel/data/citas";
import { listEspecialistas } from "@/lib/panel/data/especialistas";
import { Especialista } from "@/lib/panel/domain/tipos";
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
  const [especialistas, setEspecialistas] = useState<Especialista[]>([]);
  const [especialistaSeleccionado, setEspecialistaSeleccionado] = useState<string>("todas");
  const [modalBloqueos, setModalBloqueos] = useState(false);

  // Datos por especialista para la vista comparativa de columnas
  const [agendaData, setAgendaData] = useState<
    Record<string, { citas: CitaResuelta[]; bloqueos: BloqueoResuelto[] }>
  >({});

  useEffect(() => {
    async function cargarListaEspecialistas() {
      const lista = await listEspecialistas();
      setEspecialistas(lista);
    }
    cargarListaEspecialistas();
  }, []);

  const cargarAgenda = useCallback(() => {
    if (!dia || !hoy || especialistas.length === 0) return;

    Promise.all(
      especialistas.map(async (esp) => {
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
  }, [dia, hoy, especialistas]);

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

  // Determinar qué especialistas mostrar (Todas las columnas o 1 individual)
  const especialistasAMostrar =
    especialistaSeleccionado === "todas"
      ? especialistas
      : especialistas.filter((e) => e.id === especialistaSeleccionado);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Controles superiores: Navegación de Fecha + Selector Nativo de Calendario + Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Controles de Navegación por Día y Selector de Fecha Nativo */}
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

          <input
            type="date"
            value={fechaISO(dia)}
            onChange={(e) => {
              if (e.target.value) {
                const [y, m, d] = e.target.value.split("-").map(Number);
                setDia(new Date(y, m - 1, d));
              }
            }}
            className="rounded-lg border border-brand-border bg-white px-3 py-1.5 font-bold text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none cursor-pointer shadow-sm"
          />
        </div>

        {/* Filtro por Especialista + Gestión de Bloqueos + Botón Nueva Reserva */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={especialistaSeleccionado}
            onChange={(e) => setEspecialistaSeleccionado(e.target.value)}
            className="rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-medium text-panel-sidebar focus:border-panel-sidebar focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="todas">Todas las especialistas</option>
            {especialistas.map((esp) => (
              <option key={esp.id} value={esp.id}>
                {esp.nombre}
              </option>
            ))}
          </select>

          <Button variante="secundario" onClick={() => setModalBloqueos(true)}>
            Gestión de Bloqueos
          </Button>

          <Button
            variante="primario"
            onClick={() => router.push(`/panel/nueva-reserva/servicio`)}
          >
            Nueva reserva
          </Button>
        </div>
      </div>

      {/* Parrilla de Tiempo (TimeGrid) Comparativa con columnas según filtro */}
      <Card className="p-4 sm:p-6 overflow-x-auto">
        <div className="flex gap-4 min-w-[600px]">
          {especialistasAMostrar.map((esp, index) => {
            const data = agendaData[esp.id] ?? { citas: [], bloqueos: [] };
            return (
              <div key={esp.id} className="flex-1 min-w-[180px]">
                <h3 className="mb-3 font-bold text-center text-panel-sidebar text-sm border-b pb-2">
                  {esp.nombre}
                </h3>
                <TimeGrid
                  rejilla={rejilla}
                  citas={data.citas}
                  bloqueos={data.bloqueos}
                  horaActual={horaActual}
                  ocultarHoras={index > 0}
                  onSeleccionarCita={(citaIdSel) => abrirParametros({ cita: citaIdSel })}
                  onSeleccionarBloqueVacio={() =>
                    router.push(`/panel/nueva-reserva/servicio`)
                  }
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Leyenda de Estados en la parte inferior */}
      <Legend />

      {/* Modales de Gestión */}
      {citaId && !cancelando && (
        <AppointmentDetailModal
          citaId={citaId}
          hoy={hoy}
          onCerrar={() => abrirParametros({ cita: undefined })}
          onSolicitarCancelacion={() => abrirParametros({ cita: citaId, cancelar: "1" })}
        />
      )}

      {citaId && cancelando && (
        <CancelAppointmentModal
          citaId={citaId}
          hoy={hoy}
          abierto={cancelando}
          onVolver={() => abrirParametros({ cita: citaId, cancelar: undefined })}
          onConfirmado={() => {
            abrirParametros({ cita: undefined, cancelar: undefined });
            cargarAgenda();
          }}
        />
      )}

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
