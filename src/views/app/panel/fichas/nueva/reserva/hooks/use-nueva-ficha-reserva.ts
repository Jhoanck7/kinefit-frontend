"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  useGetHistorialPorPaciente,
  useGetPacientePerfil,
  useGetPacientes,
  useUpdateCitaEstadoMutation,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import { HistorialCitaResponse, PacienteResponse } from "@/models/responses";
import { useNuevaFichaStore } from "@/stores";

export const useNuevaFichaReserva = () => {
  const router = useRouter();
  const { pacienteId, pacienteNombre, citaId, setReserva, reiniciar } =
    useNuevaFichaStore();

  const [busqueda, setBusqueda] = useState("");
  const [cambiandoEstadoId, setCambiandoEstadoId] = useState<number | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const actualizarEstadoMutation = useUpdateCitaEstadoMutation();

  const busquedaTrim = busqueda.trim();
  const { data: resultados = [] } = useGetPacientes(
    busquedaTrim || undefined,
    undefined,
    Boolean(busquedaTrim)
  );

  const pacienteIdNum = pacienteId ? Number(pacienteId) : undefined;
  const { data: perfil } = useGetPacientePerfil(
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
    setErrorMsg(null);
    try {
      await actualizarEstadoMutation.mutateAsync({
        id: citaIdNum,
        data: { estadoNuevo: "Atendida" },
      });
      setReserva(pacienteId!, pacienteNombre!, String(citaIdNum));
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
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
    errorMsg,

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
