"use client";

import { useRouter } from "next/navigation";

import { useGetEspecialistas } from "@/hooks/api";
import { useNuevaReservaStore } from "@/lib/store/useNuevaReservaStore";

export const PASOS_NUEVA_RESERVA = [
  { etiqueta: "Servicio" },
  { etiqueta: "Horario" },
  { etiqueta: "Especialista" },
  { etiqueta: "Paciente" },
  { etiqueta: "Notas y resumen" },
];

export const NOMBRE_SERVICIO: Record<string, string> = {
  embarazadas: "Embarazadas",
  masajes_pareja: "Masajes en pareja",
  masajes: "Masajes (masoterapia)",
  masajes_premium: "Masajes Premium",
  masajes_reductivos: "Masajes Reductivos",
  voucher_regalo: "Voucher para Regalo",
  kinesiologia: "Kinesiología",
};

// Mismo mapeo dominio→id real usado en el resumen de la reserva; el enum de
// Servicio del dominio aún no tiene una fuente única compartida con el
// catálogo real de servicios del backend.
const MAPA_SERVICIO_ID: Record<string, number> = {
  masajes: 1,
  kinesiologia: 2,
  embarazadas: 3,
  masajes_pareja: 4,
  masajes_premium: 5,
  masajes_reductivos: 6,
  voucher_regalo: 7,
};

export const useEspecialista = () => {
  const router = useRouter();
  const {
    fecha,
    hora,
    pacienteNombre,
    servicio,
    especialistaId,
    especialistaNombre,
    setEspecialista,
  } = useNuevaReservaStore();

  const servicioId = servicio ? MAPA_SERVICIO_ID[servicio] : undefined;

  // API calls
  const { data: especialistas = [], isLoading } = useGetEspecialistas(
    servicioId,
    true
  );

  const nombreServicio = servicio
    ? (NOMBRE_SERVICIO[servicio] ?? servicio)
    : undefined;

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
    servicio,
    nombreServicio,
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
