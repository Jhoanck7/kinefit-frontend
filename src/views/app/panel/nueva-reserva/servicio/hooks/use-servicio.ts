"use client";

import { useRouter } from "next/navigation";

import { Servicio } from "@/lib/tipos";
import { useNuevaReservaStore } from "@/stores";

export const PASOS_NUEVA_RESERVA = [
  { etiqueta: "Servicio" },
  { etiqueta: "Horario" },
  { etiqueta: "Especialista" },
  { etiqueta: "Paciente" },
  { etiqueta: "Notas y resumen" },
];

export interface OpcionServicio {
  id: Servicio;
  titulo: string;
}

/** Catálogo oficial de servicios */
export const CATALOGO_SERVICIOS: OpcionServicio[] = [
  { id: "embarazadas", titulo: "Embarazadas" },
  { id: "masajes_pareja", titulo: "Masajes en pareja (masoterapia)" },
  { id: "masajes", titulo: "Masajes (masoterapia)" },
  { id: "masajes_premium", titulo: "Masajes Premium (masoterapia premium)" },
  { id: "masajes_reductivos", titulo: "Masajes Reductivos" },
  { id: "voucher_regalo", titulo: "Voucher para Regalo" },
  { id: "kinesiologia", titulo: "Kinesiología" },
];

export const useServicio = () => {
  const router = useRouter();
  const {
    fecha,
    hora,
    pacienteNombre,
    especialistaNombre,
    servicio,
    setServicio,
  } = useNuevaReservaStore();

  const nombreServicio = servicio
    ? CATALOGO_SERVICIOS.find(s => s.id === servicio)?.titulo
    : undefined;

  const handleSeleccionar = (id: Servicio) => setServicio(id);
  const handleCancelar = () => router.push("/panel/agenda");
  const handleContinuar = () => router.push("/panel/nueva-reserva/horario");

  return {
    // Data
    fecha,
    hora,
    pacienteNombre,
    especialistaNombre,
    servicio,
    nombreServicio,

    // Actions
    actions: {
      handleSeleccionar,
      handleCancelar,
      handleContinuar,
    },
  };
};
