"use client";

import { useGetEspecialistas } from "@/hooks/api";

/** Obtiene los especialistas activos para la vista de configuración de horarios */
export const useHorarios = () => {
  const { data: especialistas = [], isLoading } = useGetEspecialistas(
    undefined,
    true
  );

  return {
    especialistas,
    isLoading,
  };
};
