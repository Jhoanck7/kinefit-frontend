"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useHoyPanel } from "@/lib/panel/reloj";
import { Especialista } from "@/lib/panel/domain/tipos";
import { listEspecialistas } from "@/lib/panel/data/especialistas";
import { getAgendaDia, CitaResuelta, BloqueoResuelto } from "@/lib/panel/data/citas";
import { generarRejillaDia } from "@/lib/panel/domain/horario";
import { DiaSemanaId } from "@/lib/panel/domain/tipos";
import { fechaISO } from "@/lib/panel/domain/formato";
import { TimeGrid } from "@/components/panel/domain/TimeGrid";
import { Legend } from "@/components/panel/domain/Legend";
import { AppointmentDetailModal } from "@/components/panel/domain/AppointmentDetailModal";
import { CancelAppointmentModal } from "@/components/panel/domain/CancelAppointmentModal";
import { GestionBloqueosModal } from "@/components/panel/domain/GestionBloqueosModal";

function AgendaContenido() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hoy = useHoyPanel();

  const fechaParam = searchParams.get("fecha");
  const citaId = searchParams.get("cita");

  const [dia, setDia] = useState<Date>(() => {
    if (fechaParam) {
      const [y, m, d] = fechaParam.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    return hoy ?? new Date();
  });

  const [horaActual, setHoraActual] = useState<string | null>(null);
  const [especialistas, setEspecialistas] = useState<Especialista[]>([]);
  const [especialistaSeleccionado, setEspecialistaSeleccionado] = useState<string>("todas");
  const [agendaData, setAgendaData] = useState<Record<string, { citas: CitaResuelta[]; bloqueos: BloqueoResuelto[] }>>({});
  const [modalBloqueos, setModalBloqueos] = useState(false);

  useEffect(() => {
    async function cargarListaEspecialistas() {
      const lista = await listEspecialistas();
      setEspecialistas(lista);
    }
    cargarListaEspecialistas();
  }, []);

  const cargarAgenda = useCallback(async () => {
    if (!hoy || especialistas.length === 0) return;

    try {
      const resultados = await Promise.all(
        especialistas.map(async (esp) => {
          const res = await getAgendaDia(esp.id, dia, hoy);
          return { espId: esp.id, data: res };
        })
      );

      const mapa: Record<string, { citas: CitaResuelta[]; bloqueos: BloqueoResuelto[] }> = {};
      resultados.forEach((r) => {
        mapa[r.espId] = r.data;
      });
      setAgendaData(mapa);
    } catch (err) {
      console.error("Error al cargar la agenda:", err);
    }
  }, [dia, hoy, especialistas]);

  useEffect(() => {
    cargarAgenda();
  }, [cargarAgenda]);

  useEffect(() => {
    if (!hoy) return;
    const ahora = new Date();
    const esMismoDia =
      ahora.getFullYear() === dia.getFullYear() &&
      ahora.getMonth() === dia.getMonth() &&
      ahora.getDate() === dia.getDate();

    if (esMismoDia) {
      const h = ahora.getHours().toString().padStart(2, "0");
      const m = ahora.getMinutes().toString().padStart(2, "0");
      setHoraActual(`${h}:${m}`);
    } else {
      setHoraActual(null);
    }
  }, [dia, hoy]);

  function abrirParametros(params: Record<string, string | undefined>) {
    const actuales = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([clave, valor]) => {
      if (valor === undefined) actuales.delete(clave);
      else actuales.set(clave, valor);
    });
    const query = actuales.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function irADia(delta: number) {
    const nueva = new Date(dia);
    nueva.setDate(nueva.getDate() + delta);
    setDia(nueva);
    abrirParametros({ fecha: fechaISO(nueva) });
  }

  function irAHoy() {
    if (!hoy) return;
    setDia(hoy);
    abrirParametros({ fecha: fechaISO(hoy) });
  }

  const rejilla = generarRejillaDia(dia.getDay() as DiaSemanaId);
  const cancelando = searchParams.get("cancelar") === "1";

  const especialistasAMostrar =
    especialistaSeleccionado === "todas"
      ? especialistas
      : especialistas.filter((e) => e.id === especialistaSeleccionado);

  return (
    <div className="mx-auto max-w-6xl space-y-6 font-sans shadow-none">
      {/* Barra superior de controles limpia */}
      <div className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 bg-white p-3 rounded-none shadow-none">
        {/* Controles de Navegación por Día */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-slate-200 bg-white divide-x divide-slate-200 rounded-none">
            <button
              type="button"
              onClick={() => irADia(-1)}
              aria-label="Día anterior"
              className="px-3 py-1.5 font-sans text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={irAHoy}
              className="px-3 py-1.5 font-sans text-xs font-bold uppercase tracking-wider text-slate-900 hover:bg-slate-50 focus:outline-none"
            >
              HOY
            </button>
            <button
              type="button"
              onClick={() => irADia(1)}
              aria-label="Día siguiente"
              className="px-3 py-1.5 font-sans text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none"
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
            className="border border-slate-200 bg-white px-3 py-1.5 font-sans text-xs font-medium text-slate-900 rounded-none focus:border-slate-900 focus:outline-none cursor-pointer"
          />
        </div>

        {/* Filtro por Especialista + Botones */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={especialistaSeleccionado}
            onChange={(e) => setEspecialistaSeleccionado(e.target.value)}
            className="border border-slate-200 bg-white px-3 py-1.5 font-sans text-xs font-medium text-slate-900 rounded-none focus:border-slate-900 focus:outline-none cursor-pointer uppercase tracking-wider"
          >
            <option value="todas">TODAS LAS ESPECIALISTAS</option>
            {especialistas.map((esp) => (
              <option key={esp.id} value={esp.id}>
                {esp.nombre.toUpperCase()}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setModalBloqueos(true)}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-sans text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-none shadow-none"
          >
            BLOQUEOS
          </button>

          <button
            type="button"
            onClick={() => router.push(`/panel/nueva-reserva/servicio`)}
            className="bg-[#003366] text-white hover:bg-[#002244] font-sans text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-none shadow-none"
          >
            NUEVA RESERVA
          </button>
        </div>
      </div>

      {/* Parrilla de Tiempo (TimeGrid) Frameless */}
      <div className="overflow-x-auto py-2">
        <div className="flex gap-6 min-w-[600px]">
          {especialistasAMostrar.map((esp, index) => {
            const data = agendaData[esp.id] ?? { citas: [], bloqueos: [] };
            return (
              <div key={esp.id} className="flex-1 min-w-[180px]">
                <h3 className="mb-4 text-center font-sans font-semibold text-sm text-slate-800 tracking-wide">
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
      </div>

      {/* Leyenda de Estados */}
      <Legend />

      {/* Modales de Gestión */}
      {citaId && !cancelando && (
        <AppointmentDetailModal
          citaId={citaId}
          hoy={hoy ?? new Date()}
          onCerrar={() => abrirParametros({ cita: undefined })}
          onSolicitarCancelacion={() => abrirParametros({ cita: citaId, cancelar: "1" })}
          onEstadoCambiar={cargarAgenda}
        />
      )}

      {citaId && cancelando && (
        <CancelAppointmentModal
          citaId={citaId}
          hoy={hoy ?? new Date()}
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
