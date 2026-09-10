"use client";

import { useRouter } from "next/navigation";

import { useGetPlantillas } from "@/hooks/api";

export const usePlantillas = () => {
  const router = useRouter();
  const { data: plantillas } = useGetPlantillas(false);

  const handleVolver = () => router.push("/panel/documentos");
  const handleNuevaPlantilla = () =>
    router.push("/panel/documentos/plantillas/nuevo");
  const handleEditarPlantilla = (plantillaId: number) =>
    router.push(`/panel/documentos/plantillas/nuevo?editar=${plantillaId}`);

  return {
    plantillas,
    actions: {
      handleVolver,
      handleNuevaPlantilla,
      handleEditarPlantilla,
    },
  };
};
