"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  useEliminarPlantillaMutation,
  useGetPlantillas,
  useUpdatePlantillaEstadoMutation,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import { PlantillaResponse } from "@/models/responses";

export const usePlantillas = () => {
  const router = useRouter();
  const { data: plantillas } = useGetPlantillas(false);
  const estadoMutation = useUpdatePlantillaEstadoMutation();
  const eliminarMutation = useEliminarPlantillaMutation();
  const [plantillaAEliminar, setPlantillaAEliminar] =
    useState<PlantillaResponse | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const handleSolicitarEliminacion = (plantilla: PlantillaResponse) => {
    setErrorEliminar(null);
    setPlantillaAEliminar(plantilla);
  };

  const handleCancelarEliminacion = () => {
    setPlantillaAEliminar(null);
    setErrorEliminar(null);
  };

  const handleConfirmarEliminacion = async () => {
    if (!plantillaAEliminar) return;
    try {
      await eliminarMutation.mutateAsync(plantillaAEliminar.id);
      setPlantillaAEliminar(null);
    } catch (err: unknown) {
      setErrorEliminar(handleApiError(err).message);
    }
  };
  const [errorEstado, setErrorEstado] = useState<string | null>(null);

  const handleVolver = () => router.push("/panel/documentos");
  const handleNuevaPlantilla = () =>
    router.push("/panel/documentos/plantillas/nuevo");
  const handleEditarPlantilla = (plantillaId: number) =>
    router.push(`/panel/documentos/plantillas/nuevo?editar=${plantillaId}`);

  const handleToggleEstado = async (plantilla: PlantillaResponse) => {
    setErrorEstado(null);
    try {
      await estadoMutation.mutateAsync({
        id: plantilla.id,
        activo: !plantilla.activo,
      });
    } catch (err: unknown) {
      setErrorEstado(handleApiError(err).message);
    }
  };

  return {
    plantillas,
    errorEstado,
    actualizandoEstadoId: estadoMutation.isPending
      ? estadoMutation.variables?.id
      : null,
    plantillaAEliminar,
    errorEliminar,
    eliminando: eliminarMutation.isPending,
    actions: {
      handleVolver,
      handleNuevaPlantilla,
      handleEditarPlantilla,
      handleToggleEstado,
      handleSolicitarEliminacion,
      handleCancelarEliminacion,
      handleConfirmarEliminacion,
    },
  };
};
