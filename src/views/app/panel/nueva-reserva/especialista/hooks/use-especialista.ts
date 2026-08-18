"use client";

import { useRouter } from "next/navigation";

import { useGetEspecialistas } from "@/hooks/api";
import { useNuevaReservaStore } from "@/stores";

export const PASOS_NUEVA_RESERVA = [
  { etiqueta: "Servicio" },
  { etiqueta: "Horario" },
  { etiqueta: "Especialista" },
  { etiqueta: "Paciente" },
  { etiqueta: "Notas y resumen" },
];

export const useEspecialista = () => {
  const router = useRouter();
  const {
    fecha,
    hora,
    pacienteNombre,
    servicioId,
    servicioNombre,
    especialistaId,
    especialistaNombre,
    setEspecialista,
  } = useNuevaReservaStore();

  // API calls
  const { data: especialistas = [], isLoading } = useGetEspecialistas(
    servicioId ?? undefined,
    true
  );

  // Actions
  const handleSeleccionar = (id: string) => {
    const esp = especialistas.find(e => String(e.id) === id);
    if (esp) setEspecialista(String(esp.id), esp.nombre);
  };
  const handleVolver = () => router.push("/panel/nueva-reserva/horario");
  const handleCancelar = () => router.push("/panel/agenda");
  const handleContinuar = () => router.push("/panel/nueva-reserva/paciente");

  return {
    // Data
    fecha,
    hora,
    pacienteNombre,
    nombreServicio: servicioNombre,
    especialistaId,
    especialistaNombre,
    especialistas,

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
