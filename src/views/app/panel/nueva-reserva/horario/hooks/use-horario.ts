"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  useGetConfiguracionSistema,
  useGetFechasDisponibles,
  useGetHorasDisponibles,
  useGetPacientePerfil,
} from "@/hooks/api";
import { useHoyPanel } from "@/hooks/common";
import { fechaISO } from "@/lib/formato";
import {
  bloquesRequeridos,
  sonConsecutivas,
  sumarMinutos,
} from "@/lib/horario";
import { useNuevaReservaStore } from "@/stores";

import { PASOS_NUEVA_RESERVA } from "../../pasos";

export { PASOS_NUEVA_RESERVA };

const DURACION_BLOQUE_MIN = 30;
const MAX_BLOQUES = 3;
const LIMITE_MANANA = "13:00";

export const useHorario = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hoy = useHoyPanel();
  const {
    fecha,
    horasSeleccionadas,
    pacienteNombre,
    especialistaNombre,
    servicioId,
    servicioNombre,
    servicioDuracionMinutos,
    setHorario,
    setPaciente,
  } = useNuevaReservaStore();

  const { data: configuracionSistema } = useGetConfiguracionSistema();
  const duracionActiva = configuracionSistema?.duracionServiciosActiva ?? false;
  const bloquesExigidos = duracionActiva
    ? bloquesRequeridos(servicioDuracionMinutos)
    : 0;
  const duracionServicioEfectiva =
    duracionActiva && servicioDuracionMinutos
      ? servicioDuracionMinutos
      : DURACION_BLOQUE_MIN;

  const [errorSeleccion, setErrorSeleccion] = useState<string | null>(null);

  useEffect(() => {
    if (!hoy) return;

    const fechaParam = searchParams.get("fecha");
    const horaParam = searchParams.get("hora");

    if (fechaParam && !fecha) {
      const [y, m, d] = fechaParam.split("-").map(Number);
      setHorario(new Date(y, m - 1, d), horaParam ? [horaParam] : []);
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
        pacientePorParam.id,
        `${pacientePorParam.nombre} ${pacientePorParam.apellido}`
      );
    }
  }, [pacientePorParam, setPaciente]);

  const fechaIso = fecha ? fechaISO(fecha) : "";

  // API calls
  const { data: fechasDisponibles = [] } = useGetFechasDisponibles(
    servicioId ?? 0,
    duracionServicioEfectiva,
    Boolean(servicioId)
  );
  const { data: horas = [], isLoading } = useGetHorasDisponibles(
    servicioId ?? 0,
    fechaIso,
    duracionServicioEfectiva,
    Boolean(servicioId) && Boolean(fecha)
  );

  // Computed values
  const manana = horas.filter(h => h < LIMITE_MANANA);
  const tarde = horas.filter(h => h >= LIMITE_MANANA);
  const duracionMin = horasSeleccionadas.length * DURACION_BLOQUE_MIN;
  const horaInicio = [...horasSeleccionadas].sort()[0] ?? null;
  const horaTerminoCalculada = horaInicio
    ? sumarMinutos(horaInicio, duracionMin)
    : null;
  const sinDisponibilidadEnFecha =
    Boolean(fecha) && !isLoading && horas.length === 0;

  // Actions
  const handleSeleccionarHora = (hora: string) => {
    if (!fecha) return;

    const yaSeleccionada = horasSeleccionadas.includes(hora);
    let nuevas: string[];

    const maxBloques = duracionActiva ? bloquesExigidos : MAX_BLOQUES;

    if (yaSeleccionada) {
      nuevas = horasSeleccionadas.filter(h => h !== hora);
    } else {
      if (horasSeleccionadas.length >= maxBloques) {
        setErrorSeleccion(
          duracionActiva
            ? `Este servicio dura ${servicioDuracionMinutos} min (${bloquesExigidos} bloque(s)).`
            : "Puedes reservar como máximo 3 bloques (90 minutos)."
        );
        return;
      }
      nuevas = [...horasSeleccionadas, hora].sort();
    }

    if (nuevas.length > 1 && !sonConsecutivas(nuevas)) {
      setErrorSeleccion(
        "Los bloques deben ser consecutivos. Selecciona horarios seguidos."
      );
      return;
    }

    setErrorSeleccion(null);
    setHorario(fecha, nuevas);
  };

  const handleCambiarFecha = (valor: string) => {
    if (!valor) return;
    const [y, m, d] = valor.split("-").map(Number);
    setErrorSeleccion(null);
    setHorario(new Date(y, m - 1, d), []);
  };

  const handleVolver = () => router.push("/panel/nueva-reserva/servicio");
  const handleContinuar = () => {
    if (horasSeleccionadas.length === 0) {
      setErrorSeleccion("Selecciona al menos un bloque de horario.");
      return;
    }
    if (duracionActiva && horasSeleccionadas.length !== bloquesExigidos) {
      setErrorSeleccion(
        `Este servicio dura ${servicioDuracionMinutos} min (${bloquesExigidos} bloque(s)).`
      );
      return;
    }
    router.push("/panel/nueva-reserva/especialista");
  };
  const handleCancelar = () => router.push("/panel/agenda");

  return {
    // Data
    hoy,
    fecha,
    horasSeleccionadas,
    duracionMin,
    horaInicio,
    horaTerminoCalculada,
    manana,
    tarde,
    fechasDisponibles,
    duracionActiva,
    bloquesExigidos,
    servicioDuracionMinutos,
    nombreServicio: servicioNombre,
    especialistaNombre,
    pacienteNombre,
    errorSeleccion,
    sinDisponibilidadEnFecha,

    // Loading state
    isLoading,

    // Actions
    actions: {
      handleSeleccionarHora,
      handleCambiarFecha,
      handleVolver,
      handleContinuar,
      handleCancelar,
    },
  };
};
