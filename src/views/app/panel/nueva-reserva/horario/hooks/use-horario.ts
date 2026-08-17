"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo } from "react";

import { useGetAgenda, useGetPacientePerfil } from "@/hooks/api";
import { useHoyPanel } from "@/hooks/common";
import { fechaISO } from "@/lib/formato";
import { useNuevaReservaStore } from "@/stores";

import { BloqueConId } from "../components";

export const PASOS_NUEVA_RESERVA = [
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

function sumarMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(":").map(Number);
  const total = h * 60 + m + minutos;
  const hFin = Math.floor(total / 60);
  const mFin = total % 60;
  return `${hFin.toString().padStart(2, "0")}:${mFin.toString().padStart(2, "0")}`;
}

export const useHorario = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hoy = useHoyPanel();
  const { data: session } = useSession();
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

  const duracionMin = servicio
    ? (DURACION_MINUTOS_SERVICIO[servicio] ?? 60)
    : 60;
  const bloquesRequeridos = Math.ceil(duracionMin / 30);

  useEffect(() => {
    if (!hoy) return;

    const fechaParam = searchParams.get("fecha");
    const horaParam = searchParams.get("hora");

    if (fechaParam && !fecha) {
      const [y, m, d] = fechaParam.split("-").map(Number);
      setHorario(new Date(y, m - 1, d), horaParam ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoy]);

  const pacienteIdParam = searchParams.get("pacienteId");
  const pacienteIdParamNum = pacienteIdParam
    ? Number(pacienteIdParam)
    : undefined;
  const { data: pacientePorParam } = useGetPacientePerfil(
    pacienteIdParamNum ?? 0,
    Boolean(pacienteIdParamNum)
  );

  useEffect(() => {
    if (pacientePorParam) {
      setPaciente(
        String(pacientePorParam.id),
        `${pacientePorParam.nombre} ${pacientePorParam.apellido}`
      );
    }
  }, [pacientePorParam, setPaciente]);

  const numEspId = especialistaId
    ? parseInt(especialistaId.replace(/\D/g, ""), 10) || 1
    : parseInt(session?.user.especialistaId?.replace(/\D/g, "") || "1", 10) ||
      1;
  const fechaIso = fecha ? fechaISO(fecha) : "";

  // API calls
  const { data: agendaData, isLoading } = useGetAgenda(
    [numEspId],
    fechaIso,
    fechaIso,
    Boolean(fecha)
  );

  // Computed values
  const bloques: BloqueConId[] = useMemo(() => {
    if (!agendaData) return [];
    return agendaData.map(b => ({
      id: b.id,
      inicio: b.horaInicio.substring(0, 5),
      termino: b.horaFin.substring(0, 5),
      estado:
        b.estado === "Disponible"
          ? ("libre" as const)
          : b.estado === "Bloqueado"
            ? ("bloqueado" as const)
            : ("ocupado" as const),
      motivo: b.cita?.servicio,
    }));
  }, [agendaData]);

  const manana = bloques.filter(b => b.inicio < "14:00");
  const tarde = bloques.filter(b => b.inicio >= "15:00");
  const horaTerminoCalculada = hora ? sumarMinutos(hora, duracionMin) : null;
  const nombreServicio = servicio
    ? (NOMBRE_SERVICIO[servicio] ?? servicio)
    : undefined;

  // Actions
  const handleSeleccionarBloque = (bloque: BloqueConId) => {
    if (!fecha) return;
    const idxInicio = bloques.findIndex(b => b.id === bloque.id);
    const ids: number[] = [];
    for (let i = 0; i < bloquesRequeridos; i++) {
      ids.push(bloques[idxInicio + i].id);
    }
    setHorario(fecha, bloque.inicio, ids);
  };

  const handleCambiarFecha = (valor: string) => {
    if (!valor) return;
    const [y, m, d] = valor.split("-").map(Number);
    setHorario(new Date(y, m - 1, d), "");
  };

  const handleVolver = () => router.push("/panel/nueva-reserva/servicio");
  const handleContinuar = () =>
    router.push("/panel/nueva-reserva/especialista");
  const handleCancelar = () => router.push("/panel/agenda");

  return {
    // Data
    hoy,
    fecha,
    hora,
    duracionMin,
    bloquesRequeridos,
    horaTerminoCalculada,
    manana,
    tarde,
    bloques,
    nombreServicio,
    especialistaNombre,
    pacienteNombre,

    // Loading state
    isLoading,

    // Actions
    actions: {
      handleSeleccionarBloque,
      handleCambiarFecha,
      handleVolver,
      handleContinuar,
      handleCancelar,
    },
  };
};
