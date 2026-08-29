"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCreateFormatoMutation, useGetFormatos } from "@/hooks/api";
import {
  hayFormatosLocales,
  migrarFormatosLocales,
} from "@/lib/migracion-formatos";

export const useFormatos = () => {
  const router = useRouter();
  const { data: formatos } = useGetFormatos(false);
  const crearMutation = useCreateFormatoMutation();

  const [puedeMigrar, setPuedeMigrar] = useState(false);
  const [migrando, setMigrando] = useState(false);
  const [avisoMigracion, setAvisoMigracion] = useState<string | null>(null);

  useEffect(() => {
    setPuedeMigrar(hayFormatosLocales());
  }, []);

  // Es explícita y no automática: cada navegador guarda su propia copia, y
  // migrarlas al montar duplicaría los formatos en el servidor.
  const handleMigrarFormatosLocales = async () => {
    setMigrando(true);
    setAvisoMigracion(null);
    const { migrados, fallidos } = await migrarFormatosLocales(peticion =>
      crearMutation.mutateAsync(peticion)
    );
    setMigrando(false);
    setPuedeMigrar(hayFormatosLocales());
    setAvisoMigracion(
      fallidos === 0
        ? `Se importaron ${migrados} formato(s) de este navegador.`
        : `Se importaron ${migrados}, y ${fallidos} no se pudieron subir. Vuelve a intentarlo.`
    );
  };

  const handleVolver = () => router.push("/panel/fichas");
  const handleNuevoFormato = () => router.push("/panel/fichas/formatos/nuevo");
  const handleEditarFormato = (formatoId: number) =>
    router.push(`/panel/fichas/formatos/nuevo?editar=${formatoId}`);

  return {
    formatos,
    puedeMigrar,
    migrando,
    avisoMigracion,
    actions: {
      handleVolver,
      handleNuevoFormato,
      handleEditarFormato,
      handleMigrarFormatosLocales,
    },
  };
};
