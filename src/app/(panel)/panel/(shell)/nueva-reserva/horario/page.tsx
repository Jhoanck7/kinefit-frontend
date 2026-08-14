"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { BottomActionBar } from "@/components/panel/primitives/BottomActionBar";
import { Button } from "@/components/panel/primitives/Button";
import { Card } from "@/components/panel/primitives/Card";
import { StepIndicator } from "@/components/panel/primitives/StepIndicator";
import { SummaryPanel } from "@/components/panel/primitives/SummaryPanel";
import { getPaciente } from "@/lib/panel/data/pacientes";
import {
  fechaISO,
  formatearFechaExtensa,
  formatearRangoHorario,
} from "@/lib/panel/domain/formato";
import { useHoyPanel } from "@/lib/panel/reloj";
import { agendaService } from "@/lib/services/agenda.service";
import { useNuevaReservaStore } from "@/lib/store/useNuevaReservaStore";
import {
  usePanelSessionStore,
  USUARIO_SESION_PANEL,
} from "@/lib/store/usePanelSessionStore";

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
  const usuario = usePanelSessionStore(s => s.usuario) ?? USUARIO_SESION_PANEL;
  const {
    fecha,
    hora,
    pacienteNombre,
    especialistaNombre,
    especialistaId,
    servicio,
    setHorario,
    setPaciente,
  } = useNuevaReservaStore();

  const [mesVisibleState, setMesVisible] = useState<Date | null>(null);
  const mesVisible =
    mesVisibleState ??
    (hoy ? new Date(hoy.getFullYear(), hoy.getMonth(), 1) : null);
  const [bloques, setBloques] = useState<BloqueConId[]>([]);

  const duracionMin = servicio
    ? (DURACION_MINUTOS_SERVICIO[servicio] ?? 60)
    : 60;
  const bloquesRequeridos = Math.ceil(duracionMin / 30);

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
      getPaciente(pacienteIdParam).then(p => {
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
      const numEspId = especialistaId
        ? parseInt(especialistaId.replace(/\D/g, ""), 10) || 1
        : parseInt(usuario.especialistaId?.replace(/\D/g, "") || "1", 10) || 1;

      try {
        const res = await agendaService.getAgenda(
          [numEspId],
          fechaIso,
          fechaIso
        );
        const dataArr = (res as any)?.data || (Array.isArray(res) ? res : []);

        if (Array.isArray(dataArr) && dataArr.length > 0) {
          const m = dataArr.map((b: any) => ({
            id: b.id,
            inicio: b.horaInicio ? b.horaInicio.substring(0, 5) : "09:00",
            termino:
              b.horaFin || b.horaTermino
                ? (b.horaFin || b.horaTermino).substring(0, 5)
                : "09:30",
            estado:
              b.estado === "Disponible"
                ? ("libre" as const)
                : b.estado === "Bloqueado"
                  ? ("bloqueado" as const)
                  : ("ocupado" as const),
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

  const manana = bloques.filter(b => b.inicio < "14:00");
  const tarde = bloques.filter(b => b.inicio >= "15:00");

  const horaTerminoCalculada = hora ? sumarMinutos(hora, duracionMin) : null;

  return (
    <div className="mx-auto max-w-5xl font-sans shadow-none">
      <div className="mb-6">
        <StepIndicator pasos={PASOS} pasoActivo={2} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_320px]">
        <Card className="rounded-none border-slate-200 shadow-none p-6">
          <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
            ¿Cuándo será la atención?
          </h2>

          <div className="grid grid-cols-1 gap-6 divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="sm:pr-6 space-y-3">
              <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Seleccionar Fecha de Atención
              </label>
              <input
                type="date"
                value={fecha ? fechaISO(fecha) : ""}
                min={fechaISO(hoy)}
                onChange={e => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split("-").map(Number);
                    setHorario(new Date(y, m - 1, d), "");
                  }
                }}
                className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none cursor-pointer"
              />
              {fecha && (
                <p className="font-sans text-xs text-slate-700 pt-1">
                  Fecha seleccionada:{" "}
                  <span className="font-medium text-slate-900">
                    {formatearFechaExtensa(fecha)}
                  </span>
                </p>
              )}

              {hora && horaTerminoCalculada && (
                <div className="border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 space-y-0.5 rounded-none">
                  <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Franja Horaria:
                  </p>
                  <p className="font-sans font-medium text-sm text-emerald-950">
                    {hora} a {horaTerminoCalculada} hrs
                  </p>
                  <p className="font-sans text-[11px] text-emerald-700">
                    ({duracionMin} minutos · {bloquesRequeridos} bloques de 30
                    min)
                  </p>
                </div>
              )}
            </div>
            <div className="sm:pl-6">
              {!fecha ? (
                <p className="font-sans text-xs text-slate-400">
                  Selecciona primero una fecha para ver los horarios.
                </p>
              ) : (
                <>
                  <p className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-2">
                    Mañana
                  </p>
                  <BloquesChip
                    bloques={manana}
                    todosBloques={bloques}
                    bloquesRequeridos={bloquesRequeridos}
                    horaSeleccionada={hora}
                    onSeleccionar={b => setHorario(fecha, b.inicio, b.id)}
                  />
                  <div className="my-4 border-t border-slate-200" />
                  <p className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-2">
                    Tarde
                  </p>
                  <BloquesChip
                    bloques={tarde}
                    todosBloques={bloques}
                    bloquesRequeridos={bloquesRequeridos}
                    horaSeleccionada={hora}
                    onSeleccionar={b => setHorario(fecha, b.inicio, b.id)}
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
                className="font-sans text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
              >
                Cancelar reserva
              </button>
            }
            volver={
              <Button
                variante="secundario"
                onClick={() => router.push("/panel/nueva-reserva/servicio")}
              >
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
            {
              etiqueta: "Servicio",
              valor: servicio
                ? (NOMBRE_SERVICIO[servicio] ?? servicio)
                : undefined,
            },
            {
              etiqueta: "Duración",
              valor: `${duracionMin} min (${bloquesRequeridos} bloques)`,
            },
            {
              etiqueta: "Fecha",
              valor: fecha ? formatearFechaExtensa(fecha) : undefined,
            },
            {
              etiqueta: "Horario",
              valor:
                hora && horaTerminoCalculada
                  ? `${hora} a ${horaTerminoCalculada}`
                  : hora || undefined,
            },
            {
              etiqueta: "Especialista",
              valor: especialistaNombre || undefined,
            },
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
  if (bloques.length === 0)
    return (
      <p className="font-sans text-xs text-slate-400">
        Sin bloques en este tramo.
      </p>
    );

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
      {bloques.map(bloque => {
        const idxEnTodos = todosBloques.findIndex(b => b.id === bloque.id);
        const tieneSuficienteTiempo =
          idxEnTodos !== -1
            ? tieneBloquesConsecutivosDisponibles(idxEnTodos)
            : true;
        const seleccionado = bloque.inicio === horaSeleccionada;
        const noDisponible =
          bloque.estado !== "libre" || !tieneSuficienteTiempo;

        return (
          <button
            key={bloque.id}
            type="button"
            disabled={noDisponible}
            onClick={() => onSeleccionar(bloque)}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-none border px-2 py-2 text-xs font-sans transition-colors ${
              seleccionado
                ? "border-[#003366] bg-[#003366] text-white font-bold"
                : noDisponible
                  ? "border-slate-200 text-slate-300 bg-slate-50 line-through cursor-not-allowed"
                  : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-1">
              <span>
                {formatearRangoHorario(bloque.inicio, bloque.termino)}
              </span>
              {seleccionado && <span className="text-[10px] font-bold">✓</span>}
            </div>
            {bloquesRequeridos > 1 && !noDisponible && (
              <span className="text-[10px] opacity-75 font-normal">
                ({bloquesRequeridos} bloques)
              </span>
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
      <NuevaReservaHorarioContenido />
    </Suspense>
  );
}
