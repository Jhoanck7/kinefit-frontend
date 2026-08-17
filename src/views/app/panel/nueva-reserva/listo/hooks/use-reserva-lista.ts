"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { fechaISO } from "@/lib/formato";
import { definicionEstado } from "@/lib/estados";
import { useNuevaReservaStore } from "@/stores";

export const NOMBRE_SERVICIO: Record<string, string> = {
  embarazadas: "Embarazadas",
  masajes_pareja: "Masajes en pareja",
  masajes: "Masajes (masoterapia)",
  masajes_premium: "Masajes Premium",
  masajes_reductivos: "Masajes Reductivos",
  voucher_regalo: "Voucher para Regalo",
  kinesiologia: "Kinesiología",
  masoterapia: "Masoterapia",
};

export const useReservaLista = () => {
  const router = useRouter();
  const { fecha, hora, pacienteNombre, servicio, reiniciar } =
    useNuevaReservaStore();
  const definicion = definicionEstado("PorConfirmar");

  useEffect(() => {
    if (!fecha || !hora || !pacienteNombre || !servicio) {
      router.replace("/panel/nueva-reserva/servicio");
    }
  }, [fecha, hora, pacienteNombre, servicio, router]);

  const listo = Boolean(fecha && hora && pacienteNombre && servicio);

  let horaTermino: string | null = null;
  if (hora) {
    const [h, m] = hora.split(":").map(Number);
    const minutosTermino = h * 60 + m + 30;
    horaTermino = `${Math.floor(minutosTermino / 60)
      .toString()
      .padStart(2, "0")}:${(minutosTermino % 60).toString().padStart(2, "0")}`;
  }

  const nombreServicio = servicio
    ? (NOMBRE_SERVICIO[servicio] ?? servicio)
    : undefined;

  // Actions
  const handleIrALaAgenda = () => {
    if (!fecha) return;
    reiniciar();
    router.push(`/panel/agenda?fecha=${fechaISO(fecha)}`);
  };

  const handleRegistrarOtra = () => {
    reiniciar();
    router.push("/panel/nueva-reserva/servicio");
  };

  return {
    // Data
    listo,
    fecha,
    hora,
    horaTermino,
    pacienteNombre,
    nombreServicio,
    etiquetaEstado: definicion.etiqueta,

    // Actions
    actions: {
      handleIrALaAgenda,
      handleRegistrarOtra,
    },
  };
};
