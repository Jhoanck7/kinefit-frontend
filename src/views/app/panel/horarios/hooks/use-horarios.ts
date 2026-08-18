"use client";

import { useGetEspecialistas } from "@/hooks/api";

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
