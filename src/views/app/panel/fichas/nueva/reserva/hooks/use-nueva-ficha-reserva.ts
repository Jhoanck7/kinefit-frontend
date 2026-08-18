"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  useGetHistorialPorPaciente,
  useGetPacientePerfil,
  useGetPacientes,
} from "@/hooks/api";
import { HistorialCitaResponse, PacienteResponse } from "@/models/responses";
import { citaService } from "@/services";
import { useNuevaFichaStore } from "@/stores";

export const useNuevaFichaReserva = () => {
  const router = useRouter();
  const { pacienteId, pacienteNombre, citaId, setReserva, reiniciar } =
    useNuevaFichaStore();

  const [busqueda, setBusqueda] = useState("");
  const [cambiandoEstadoId, setCambiandoEstadoId] = useState<number | null>(
    null
  );

  const busquedaTrim = busqueda.trim();
  const { data: resultados = [] } = useGetPacientes(
    busquedaTrim || undefined,
    undefined,
    Boolean(busquedaTrim)
  );

  const pacienteIdNum = pacienteId ? Number(pacienteId) : undefined;
  const { data: perfil, refetch: refetchPerfil } = useGetPacientePerfil(
    pacienteIdNum ?? 0,
    Boolean(pacienteIdNum)
  );
  const { data: fichasPaciente = [] } = useGetHistorialPorPaciente(
    pacienteIdNum ?? 0,
    Boolean(pacienteIdNum)
  );

  const reservas = (perfil?.historial ?? []).map(cita => {
    const ficha = fichasPaciente.find(f => f.citaId === cita.id);
    return {
      ...cita,
      conFicha: Boolean(ficha),
      fichaId: ficha?.id,
    };
  });

  const citaSeleccionada = reservas.find(r => String(r.id) === citaId);

  // Actions
  const handleSeleccionarPaciente = (paciente: PacienteResponse) => {
    setReserva(
      String(paciente.id),
      `${paciente.nombre} ${paciente.apellido}`,
      ""
    );
    setBusqueda("");
  };

  const handleSeleccionarReserva = (cita: HistorialCitaResponse) => {
    setReserva(pacienteId!, pacienteNombre!, String(cita.id));
  };

  const handleAbrirFichaExistente = (fichaId: number) => {
    router.push(`/panel/fichas?ficha=${fichaId}`);
  };

  const handleCancelar = () => {
    reiniciar();
    router.push("/panel/fichas");
  };

  const handleContinuar = () => {
    router.push("/panel/fichas/nueva/contenido");
  };

  const handleMarcarComoAtendida = async (citaIdNum: number) => {
    setCambiandoEstadoId(citaIdNum);
    try {
      await citaService.updateEstado(citaIdNum, { estadoNuevo: "Atendida" });
      await refetchPerfil();
      setReserva(pacienteId!, pacienteNombre!, String(citaIdNum));
    } catch {
      // Ignorar fallo individual
    } finally {
      setCambiandoEstadoId(null);
    }
  };

  return {
    // Data
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
