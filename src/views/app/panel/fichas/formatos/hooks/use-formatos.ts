"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useHoyPanel } from "@/hooks/common";
import { FormatoResuelto, listFormatos } from "@/lib/panel/data/formatos";

export const useFormatos = () => {
  const router = useRouter();
  const hoy = useHoyPanel();
  const [formatos, setFormatos] = useState<FormatoResuelto[] | null>(null);

  useEffect(() => {
    if (!hoy) return;
    listFormatos(hoy).then(setFormatos);
  }, [hoy]);

  // Actions
  const handleVolver = () => router.push("/panel/fichas");
  const handleNuevoFormato = () => router.push("/panel/fichas/formatos/nuevo");
  const handleEditarFormato = (formatoId: string) =>
    router.push(`/panel/fichas/formatos/nuevo?editar=${formatoId}`);

  return {
    hoy,
    formatos,
    actions: {
      handleVolver,
      handleNuevoFormato,
      handleEditarFormato,
    },
  };
};
