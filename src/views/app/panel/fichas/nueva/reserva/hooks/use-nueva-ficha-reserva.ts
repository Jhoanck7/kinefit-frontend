"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CitaResuelta, reservasDelPaciente } from "@/lib/panel/data/citas";
import { fichaDeLaCita } from "@/lib/panel/data/fichas";
import { buscarPacientes, PacienteResuelto } from "@/lib/panel/data/pacientes";
import { useHoyPanel } from "@/lib/panel/reloj";
import { useNuevaFichaStore } from "@/lib/store/useNuevaFichaStore";
import { citaService } from "@/services";

type ReservaConFicha = CitaResuelta & { conFicha: boolean; fichaId?: string };

async function cargarReservasConFicha(pacienteId: string, hoy: Date) {
  const citas = await reservasDelPaciente(pacienteId, hoy);
  return Promise.all(
    citas.map(async cita => {
      const ficha = await fichaDeLaCita(cita.id, hoy);
      return { ...cita, conFicha: Boolean(ficha), fichaId: ficha?.id };
    })
  );
}

export const useNuevaFichaReserva = () => {
  const router = useRouter();
  const hoy = useHoyPanel();
  const { pacienteId, pacienteNombre, citaId, setReserva, reiniciar } =
    useNuevaFichaStore();

  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<PacienteResuelto[]>([]);
  const [reservas, setReservas] = useState<ReservaConFicha[]>([]);
  const [cambiandoEstadoId, setCambiandoEstadoId] = useState<string | null>(
    null
  );

  useEffect(() => {
    buscarPacientes(busqueda).then(setResultados);
  }, [busqueda]);

  useEffect(() => {
    if (!pacienteId || !hoy) return;
    cargarReservasConFicha(pacienteId, hoy).then(setReservas);
  }, [pacienteId, hoy]);

  const citaSeleccionada = reservas.find(r => r.id === citaId);

  // Actions
  const handleSeleccionarPaciente = (paciente: PacienteResuelto) => {
    setReserva(paciente.id, `${paciente.nombre} ${paciente.apellido}`, "");
    setBusqueda("");
    setResultados([]);
  };

  const handleSeleccionarReserva = (cita: CitaResuelta) => {
    setReserva(pacienteId!, pacienteNombre!, cita.id);
  };

  const handleAbrirFichaExistente = (fichaId: string) => {
    router.push(`/panel/fichas/${fichaId}`);
  };

  const handleCancelar = () => {
    reiniciar();
    router.push("/panel/fichas");
  };

  const handleContinuar = () => {
    router.push("/panel/fichas/nueva/contenido");
  };

  const handleMarcarComoAtendida = async (citaIdStr: string) => {
    setCambiandoEstadoId(citaIdStr);
    try {
      const numId = parseInt(citaIdStr.replace(/\D/g, ""), 10);
      if (!isNaN(numId)) {
        await citaService.updateEstado(numId, { estadoNuevo: "Atendida" });
        if (pacienteId && hoy) {
          const conFichas = await cargarReservasConFicha(pacienteId, hoy);
          setReservas(conFichas);
          setReserva(pacienteId, pacienteNombre!, citaIdStr);
        }
      }
    } catch {
      // Ignorar fallo individual
    } finally {
      setCambiandoEstadoId(null);
    }
  };

  return {
    // Data
    hoy,
    pacienteId,
    pacienteNombre,
    citaId,
    busqueda,
    resultados,
    reservas,
    cambiandoEstadoId,
    citaSeleccionada,

    // Actions
    actions: {
      setBusqueda,
      handleSeleccionarPaciente,
      handleSeleccionarReserva,
      handleAbrirFichaExistente,
      handleCancelar,
      handleContinuar,
      handleMarcarComoAtendida,
    },
  };
};
