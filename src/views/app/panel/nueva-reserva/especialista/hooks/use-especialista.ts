"use client";

import { useRouter } from "next/navigation";

import {
  useGetBloquesDisponibles,
  useGetEspecialistasDisponibles,
} from "@/hooks/api";
import { fechaISO } from "@/lib/formato";
import { useNuevaReservaStore } from "@/stores";

import { PASOS_NUEVA_RESERVA } from "../../pasos";

export { PASOS_NUEVA_RESERVA };

export const useEspecialista = () => {
  const router = useRouter();
  const {
    fecha,
    hora,
    horasSeleccionadas,
    pacienteNombre,
    servicioId,
    servicioNombre,
    especialistaId,
    especialistaNombre,
    setEspecialista,
  } = useNuevaReservaStore();

  const fechaIso = fecha ? fechaISO(fecha) : "";
  const horaInicio = [...horasSeleccionadas].sort()[0] ?? "";
  const duracionMinutos = horasSeleccionadas.length * 30;

  // API calls
  const { data: especialistas = [], isLoading } =
    useGetEspecialistasDisponibles(
      servicioId ?? 0,
      fechaIso,
      horaInicio,
      duracionMinutos,
      Boolean(servicioId) && Boolean(fechaIso) && Boolean(horaInicio)
    );

  // Al elegir un especialista, se resuelven sus bloques reales para esa fecha
  // (GET /bloques) — recién ahí se conocen los bloqueHorarioIds a reservar.
  const { data: bloquesDelEspecialista, isLoading: cargandoBloques } =
    useGetBloquesDisponibles(
      especialistaId ?? 0,
      fechaIso,
      Boolean(especialistaId) && Boolean(fechaIso)
    );

  const bloqueHorarioIdsResueltos = bloquesDelEspecialista
    ? horasSeleccionadas
        .map(
          h =>
            bloquesDelEspecialista.find(
              b => b.horaInicio === h && b.estado === "Disponible"
            )?.id
        )
        .filter((id): id is number => id !== undefined)
    : [];
  const resolviendoBloques = Boolean(especialistaId) && cargandoBloques;
  // Caso borde: el especialista tenía la cadena libre al listarse, pero algún
  // bloque cambió de estado antes de confirmar la elección.
  const errorResolucionBloques =
    Boolean(especialistaId) &&
    !cargandoBloques &&
    bloquesDelEspecialista !== undefined &&
    bloqueHorarioIdsResueltos.length !== horasSeleccionadas.length;

  const sinEspecialistasDisponibles = !isLoading && especialistas.length === 0;

  // Actions
  const handleSeleccionar = (id: string) => {
    const esp = especialistas.find(e => String(e.id) === id);
    if (esp) setEspecialista(esp.id, esp.nombre, []);
  };
  const handleVolver = () => router.push("/panel/nueva-reserva/horario");
  const handleCancelar = () => router.push("/panel/agenda");
  const handleContinuar = () => {
    if (!especialistaId || resolviendoBloques || errorResolucionBloques) {
      return;
    }
    setEspecialista(
      especialistaId,
      especialistaNombre ?? "",
      bloqueHorarioIdsResueltos
    );
    router.push("/panel/nueva-reserva/paciente");
  };

  return {
    // Data
    fecha,
    hora,
    pacienteNombre,
    nombreServicio: servicioNombre,
    especialistaId,
    especialistaNombre,
    especialistas,
    sinEspecialistasDisponibles,
    resolviendoBloques,
    errorResolucionBloques,

    // Loading state
    isLoading,

    // Actions
    actions: {
      handleSeleccionar,
      handleVolver,
      handleCancelar,
      handleContinuar,
    },
  };
};
