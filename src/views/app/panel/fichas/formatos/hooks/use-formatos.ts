"use client";

import { useRouter } from "next/navigation";

import { useGetFormatos } from "@/hooks/api";

export const useFormatos = () => {
  const router = useRouter();
  const { data: formatos } = useGetFormatos();

  // Actions
  const handleVolver = () => router.push("/panel/fichas");
  const handleNuevoFormato = () => router.push("/panel/fichas/formatos/nuevo");
  const handleEditarFormato = (formatoId: string) =>
    router.push(`/panel/fichas/formatos/nuevo?editar=${formatoId}`);

  return {
    formatos,
    actions: {
      handleVolver,
      handleNuevoFormato,
      handleEditarFormato,
    },
  };
};
