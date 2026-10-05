"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { definicionEstado } from "@/lib/estados";
import { fechaISO } from "@/lib/formato";
import { useNuevaReservaStore } from "@/stores";

/** Arma el resumen final de la reserva recién creada y redirige al inicio del asistente si falta algún dato */
export const useReservaLista = () => {
  const router = useRouter();
  const {
    fecha,
    hora,
    horasSeleccionadas,
    pacienteNombre,
    servicioNombre,
    reiniciar,
  } = useNuevaReservaStore();
  const definicion = definicionEstado("PorConfirmar");
  const saliendoRef = useRef(false);

  useEffect(() => {
    if (saliendoRef.current) return;
    if (!fecha || !hora || !pacienteNombre || !servicioNombre) {
      router.replace("/panel/nueva-reserva/servicio");
    }
  }, [fecha, hora, pacienteNombre, servicioNombre, router]);

  const listo = Boolean(fecha && hora && pacienteNombre && servicioNombre);

  let horaTermino: string | null = null;
  if (hora) {
    const duracionMin = Math.max(horasSeleccionadas.length, 1) * 30;
    const [h, m] = hora.split(":").map(Number);
    const minutosTermino = h * 60 + m + duracionMin;
    horaTermino = `${Math.floor(minutosTermino / 60)
      .toString()
      .padStart(2, "0")}:${(minutosTermino % 60).toString().padStart(2, "0")}`;
  }

  const handleIrALaAgenda = () => {
    if (!fecha) return;
    saliendoRef.current = true;
    reiniciar();
    router.push(`/panel/agenda?fecha=${fechaISO(fecha)}`);
  };

  const handleRegistrarOtra = () => {
    saliendoRef.current = true;
    reiniciar();
    router.push("/panel/nueva-reserva/servicio");
  };

  return {
    listo,
    fecha,
    hora,
    horaTermino,
    pacienteNombre,
    nombreServicio: servicioNombre,
    etiquetaEstado: definicion.etiqueta,
    colorRolEstado: definicion.colorRol,

    actions: {
      handleIrALaAgenda,
      handleRegistrarOtra,
    },
  };
};
