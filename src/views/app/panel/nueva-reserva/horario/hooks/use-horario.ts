"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

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
    servicioNombre,
    setHorario,
    setPaciente,
  } = useNuevaReservaStore();

  const [bloquesRequeridos, setBloquesRequeridos] = useState(1);
  const [errorSeleccion, setErrorSeleccion] = useState<string | null>(null);
  const duracionMin = bloquesRequeridos * 30;

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

  // Actions
  const handleSeleccionarBloque = (bloque: BloqueConId) => {
    if (!fecha) return;
    const idxInicio = bloques.findIndex(b => b.id === bloque.id);
    const ids: number[] = [];
    for (let i = 0; i < bloquesRequeridos; i++) {
      const siguiente = bloques[idxInicio + i];
      if (!siguiente || siguiente.estado !== "libre") {
        setErrorSeleccion(
          `No hay ${bloquesRequeridos} bloques consecutivos disponibles desde las ${bloque.inicio}. Elige otro horario o reduce la duración.`
        );
        return;
      }
      ids.push(siguiente.id);
    }
    setErrorSeleccion(null);
    setHorario(fecha, bloque.inicio, ids);
  };

  const handleCambiarDuracion = (valor: number) => {
    setBloquesRequeridos(valor);
    setErrorSeleccion(null);
    if (fecha) setHorario(fecha, "");
  };

  const handleCambiarFecha = (valor: string) => {
    if (!valor) return;
    const [y, m, d] = valor.split("-").map(Number);
    setErrorSeleccion(null);
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
    nombreServicio: servicioNombre,
    especialistaNombre,
    pacienteNombre,
    errorSeleccion,

    // Loading state
    isLoading,

    // Actions
    actions: {
      handleSeleccionarBloque,
      handleCambiarDuracion,
      handleCambiarFecha,
      handleVolver,
      handleContinuar,
      handleCancelar,
    },
  };
};
