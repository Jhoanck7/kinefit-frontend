"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useHoyPanel } from "@/lib/panel/reloj";
import { usePanelSessionStore, USUARIO_SESION_PANEL } from "@/lib/store/usePanelSessionStore";
import { useNuevaReservaStore } from "@/lib/store/useNuevaReservaStore";
import { getPaciente } from "@/lib/panel/data/pacientes";
import { agendaService } from "@/lib/services/agenda.service";
import { fechaISO, formatearFechaExtensa, formatearRangoHorario } from "@/lib/panel/domain/formato";
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

const NOMBRE_SERVICIO: Record<string, string> = {
  embarazadas: "Embarazadas",
  masajes_pareja: "Masajes en pareja",
  masajes: "Masajes (masoterapia)",
  masajes_premium: "Masajes Premium",
  masajes_reductivos: "Masajes Reductivos",
  voucher_regalo: "Voucher para Regalo",
  kinesiologia: "Kinesiología",
};

const DURACION_MINUTOS_SERVICIO: Record<string, number> = {
  embarazadas: 60,
  masajes_pareja: 60,
  masajes: 30,
  masajes_premium: 60,
  masajes_reductivos: 60,
  voucher_regalo: 60,
  kinesiologia: 45,
};

type EstadoBloque = "libre" | "ocupado" | "bloqueado";

interface BloqueConId {
  id: number;
  inicio: string;
  termino: string;
  estado: EstadoBloque;
  motivo?: string;
}

function sumarMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(":").map(Number);
  const total = h * 60 + m + minutos;
  const hFin = Math.floor(total / 60);
  const mFin = total % 60;
  return `${hFin.toString().padStart(2, "0")}:${mFin.toString().padStart(2, "0")}`;
}

function NuevaReservaHorarioContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hoy = useHoyPanel();
  const usuario = usePanelSessionStore((s) => s.usuario) ?? USUARIO_SESION_PANEL;
  const { fecha, hora, pacienteNombre, especialistaNombre, especialistaId, servicio, setHorario, setPaciente } = useNuevaReservaStore();

  const [mesVisible, setMesVisible] = useState<Date | null>(null);
  const [bloques, setBloques] = useState<BloqueConId[]>([]);

  const duracionMin = servicio ? (DURACION_MINUTOS_SERVICIO[servicio] ?? 60) : 60;
  const bloquesRequeridos = Math.ceil(duracionMin / 30);

  useEffect(() => {
    if (!hoy) return;
    if (mesVisible === null) setMesVisible(new Date(hoy.getFullYear(), hoy.getMonth(), 1));

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
    if (!fecha) {
      setBloques([]);
      return;
    }

    async function cargarAgendaBackend() {
      const fechaIso = fechaISO(fecha!);
      const numEspId = especialistaId ? parseInt(especialistaId.replace(/\D/g, ""), 10) || 1 : parseInt(usuario.especialistaId?.replace(/\D/g, "") || "1", 10) || 1;

      try {
        const res = await agendaService.getAgenda([numEspId], fechaIso, fechaIso);
        const dataArr = (res as any)?.data || (Array.isArray(res) ? res : []);

        if (Array.isArray(dataArr) && dataArr.length > 0) {
          const m = dataArr.map((b: any) => ({
            id: b.id,
            inicio: b.horaInicio ? b.horaInicio.substring(0, 5) : "09:00",
            termino: (b.horaFin || b.horaTermino) ? (b.horaFin || b.horaTermino).substring(0, 5) : "09:30",
            estado: b.estado === "Disponible" ? ("libre" as const) : b.estado === "Bloqueado" ? ("bloqueado" as const) : ("ocupado" as const),
            motivo: b.motivo,
          }));
          setBloques(m);
          return;
        }
      } catch {
        // Fallback
      }

      setBloques([]);
    }

    cargarAgendaBackend();
  }, [fecha, especialistaId, usuario.especialistaId]);

  if (!hoy || !mesVisible) return <div aria-hidden />;

  const manana = bloques.filter((b) => b.inicio < "14:00");
  const tarde = bloques.filter((b) => b.inicio >= "15:00");

  const horaTerminoCalculada = hora ? sumarMinutos(hora, duracionMin) : null;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <StepIndicator pasos={PASOS} pasoActivo={2} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_320px]">
        <Card>
          <h2 className="mb-4 text-lg font-bold text-panel-sidebar">¿Cuándo será la atención?</h2>



          <div className="grid grid-cols-1 gap-6 divide-y divide-brand-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="sm:pr-6 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wide text-brand-muted">
                Seleccionar Fecha de Atención
              </label>
              <input
                type="date"
                value={fecha ? fechaISO(fecha) : ""}
                min={fechaISO(hoy)}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split("-").map(Number);
                    setHorario(new Date(y, m - 1, d), "");
                  }
                }}
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-bold text-panel-sidebar focus:border-panel-sidebar focus:outline-none cursor-pointer shadow-sm"
              />
              {fecha && (
                <p className="text-xs font-semibold text-panel-sidebar pt-2">
                  Fecha seleccionada: {formatearFechaExtensa(fecha)}
                </p>
              )}

              {hora && horaTerminoCalculada && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 space-y-1">
                  <p className="font-bold">Franja Horaria Consumida:</p>
                  <p className="text-sm font-semibold">
                    {hora} a {horaTerminoCalculada} hrs
                  </p>
                  <p className="text-xs italic text-emerald-700">
                    ({duracionMin} minutos / {bloquesRequeridos} bloques de 30 min)
                  </p>
                </div>
              )}
            </div>
            <div className="sm:pl-6">
              {!fecha ? (
                <p className="text-sm text-brand-muted">Selecciona primero una fecha para ver los horarios.</p>
              ) : (
                <>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-muted">Mañana</p>
                  <BloquesChip
                    bloques={manana}
                    todosBloques={bloques}
                    bloquesRequeridos={bloquesRequeridos}
                    horaSeleccionada={hora}
                    onSeleccionar={(b) => setHorario(fecha, b.inicio, b.id)}
                  />
                  <div className="my-4 border-t border-brand-border" />
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-muted">Tarde</p>
                  <BloquesChip
                    bloques={tarde}
                    todosBloques={bloques}
                    bloquesRequeridos={bloquesRequeridos}
                    horaSeleccionada={hora}
                    onSeleccionar={(b) => setHorario(fecha, b.inicio, b.id)}
                  />
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
            volver={
              <Button variante="secundario" onClick={() => router.push("/panel/nueva-reserva/servicio")}>
                Volver
              </Button>
            }
            avanzar={
              <Button
                variante="primario"
                disabled={!fecha || !hora}
                onClick={() => router.push("/panel/nueva-reserva/especialista")}
              >
                Continuar
              </Button>
            }
          />
        </Card>

        <SummaryPanel
          filas={[
            { etiqueta: "Servicio", valor: servicio ? (NOMBRE_SERVICIO[servicio] ?? servicio) : undefined },
            { etiqueta: "Duración", valor: `${duracionMin} min (${bloquesRequeridos} bloques)` },
            { etiqueta: "Fecha", valor: fecha ? formatearFechaExtensa(fecha) : undefined },
            {
              etiqueta: "Horario",
              valor: hora && horaTerminoCalculada ? `${hora} a ${horaTerminoCalculada}` : hora || undefined,
            },
            { etiqueta: "Especialista", valor: especialistaNombre || undefined },
            { etiqueta: "Paciente", valor: pacienteNombre ?? undefined },
          ]}
        />
      </div>
    </div>
  );
}

function BloquesChip({
  bloques,
  todosBloques,
  bloquesRequeridos,
  horaSeleccionada,
  onSeleccionar,
}: {
  bloques: BloqueConId[];
  todosBloques: BloqueConId[];
  bloquesRequeridos: number;
  horaSeleccionada: string | null;
  onSeleccionar: (bloque: BloqueConId) => void;
}) {
  if (bloques.length === 0) return <p className="text-sm text-brand-muted">Sin bloques en este tramo.</p>;

  // Verificar si a partir de un bloque existen 'bloquesRequeridos' consecutivos libres
  function tieneBloquesConsecutivosDisponibles(idxInicio: number): boolean {
    if (idxInicio + bloquesRequeridos > todosBloques.length) return false;
    for (let offset = 0; offset < bloquesRequeridos; offset++) {
      if (todosBloques[idxInicio + offset].estado !== "libre") {
        return false;
      }
    }
    return true;
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {bloques.map((bloque) => {
        const idxEnTodos = todosBloques.findIndex((b) => b.id === bloque.id);
        const tieneSuficienteTiempo = idxEnTodos !== -1 ? tieneBloquesConsecutivosDisponibles(idxEnTodos) : true;
        const seleccionado = bloque.inicio === horaSeleccionada;
        const noDisponible = bloque.estado !== "libre" || !tieneSuficienteTiempo;

        const tooltip =
          bloque.estado === "ocupado"
            ? "Bloque ocupado"
            : bloque.estado === "bloqueado"
            ? bloque.motivo
            : !tieneSuficienteTiempo
            ? `Se requieren ${bloquesRequeridos} bloques consecutivos disponibles`
            : undefined;

        return (
          <button
            key={bloque.id}
            type="button"
            disabled={noDisponible}
            title={tooltip}
            onClick={() => onSeleccionar(bloque)}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-lg border px-2 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar ${
              seleccionado
                ? "border-panel-sidebar bg-panel-sidebar text-white font-bold"
                : noDisponible
                  ? "border-brand-border text-brand-border/60 bg-slate-50 line-through cursor-not-allowed"
                  : "border-brand-border text-panel-sidebar hover:border-panel-sidebar/40"
            }`}
          >
            <div className="flex items-center gap-1">
              <span>{formatearRangoHorario(bloque.inicio, bloque.termino)}</span>
              {seleccionado && (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </div>
            {bloquesRequeridos > 1 && !noDisponible && (
              <span className="text-[10px] opacity-75 font-normal">({bloquesRequeridos} bloques)</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function NuevaReservaHorarioPage() {
  return (
    <Suspense fallback={<div aria-hidden />}>
      <NuevaReservaHorarioContenido />
    </Suspense>
  );
}
