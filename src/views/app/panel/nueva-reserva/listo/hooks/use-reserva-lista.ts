"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { definicionEstado } from "@/lib/estados";
import { fechaISO } from "@/lib/formato";
import { useNuevaReservaStore } from "@/stores";

export const useReservaLista = () => {
  const router = useRouter();
  const { fecha, hora, pacienteNombre, servicioNombre, reiniciar } =
    useNuevaReservaStore();
  const definicion = definicionEstado("PorConfirmar");

  useEffect(() => {
    if (!fecha || !hora || !pacienteNombre || !servicioNombre) {
      router.replace("/panel/nueva-reserva/servicio");
    }
  }, [fecha, hora, pacienteNombre, servicioNombre, router]);

  const listo = Boolean(fecha && hora && pacienteNombre && servicioNombre);

  let horaTermino: string | null = null;
  if (hora) {
    const [h, m] = hora.split(":").map(Number);
    const minutosTermino = h * 60 + m + 30;
    horaTermino = `${Math.floor(minutosTermino / 60)
      .toString()
      .padStart(2, "0")}:${(minutosTermino % 60).toString().padStart(2, "0")}`;
  }

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
    nombreServicio: servicioNombre,
    etiquetaEstado: definicion.etiqueta,

    // Actions
    actions: {
      handleIrALaAgenda,
      handleRegistrarOtra,
    },
  };
};
