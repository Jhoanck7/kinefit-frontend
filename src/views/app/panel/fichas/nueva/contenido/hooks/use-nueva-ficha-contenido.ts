"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  useCreateFichaMutation,
  useGetCita,
  useGetFormatos,
  useSubirAdjuntoMutation,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import { useNuevaFichaStore } from "@/stores";

export const useNuevaFichaContenido = () => {
  const router = useRouter();
  const {
    pacienteNombre,
    citaId,
    formatoId,
    contenido,
    adjuntos,
    setFormato,
    setCampo,
    agregarAdjunto,
    quitarAdjunto,
    reiniciar,
  } = useNuevaFichaStore();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const crearFichaMutation = useCreateFichaMutation();
  const subirAdjuntoMutation = useSubirAdjuntoMutation();

  const { data: formatosDisponibles = [] } = useGetFormatos();
  const { data: cita } = useGetCita(
    citaId ? Number(citaId) : 0,
    Boolean(citaId)
  );

  useEffect(() => {
    if (formatosDisponibles.length > 0 && !formatoId) {
      setFormato(formatosDisponibles[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatosDisponibles]);

  // El selector trabaja con ids de texto; el formato se identifica por número.
  const opcionesFormato = formatosDisponibles.map(f => ({
    id: String(f.id),
    titulo: f.nombre,
  }));
  const formato = formatosDisponibles.find(f => f.id === formatoId) ?? null;
  const nombreFormato = formato?.nombre;

  // Actions
  const handleSeleccionarFormato = (id: string) => setFormato(Number(id));

  const handleCambiarCampo = (
    campoId: string,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => setCampo(campoId, e.target.value);

  const handleCancelar = () => {
    reiniciar();
    router.push("/panel/fichas");
  };

  const handleVolver = () => router.push("/panel/fichas/nueva/reserva");

  const handleIrACrearFormato = () =>
    router.push("/panel/fichas/formatos/nuevo");

  const handleCerrarError = () => setErrorMsg(null);

  const handleGuardar = async () => {
    if (!citaId || !formatoId) return;

    setErrorMsg(null);

    try {
      // El tipo lo decide el formato elegido, no el asistente.
      const creada = await crearFichaMutation.mutateAsync({
        citaId: Number(citaId),
        tipo: formato?.tipo,
        formatoFichaId: formatoId,
        contenido: (contenido as Record<string, string>) || {},
      });

      if (adjuntos && adjuntos.length > 0) {
        for (const nombreArch of adjuntos) {
          try {
            const dummyFile = new File(["contenido"], nombreArch, {
              type: "text/plain",
            });
            await subirAdjuntoMutation.mutateAsync({
              fichaId: creada.id,
              archivo: dummyFile,
            });
          } catch {
            // Ignorar fallo individual
          }
        }
      }

      reiniciar();
      router.push("/panel/fichas");
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return {
    // Data
    pacienteNombre,
    citaId,
    formatoId,
    contenido,
    adjuntos,
    cita,
    formato,
    opcionesFormato,
    guardando: crearFichaMutation.isPending || subirAdjuntoMutation.isPending,
    errorMsg,
    nombreFormato,

    // Actions
    actions: {
      handleSeleccionarFormato,
      handleCambiarCampo,
      agregarAdjunto,
      quitarAdjunto,
      handleCancelar,
      handleVolver,
      handleIrACrearFormato,
      handleCerrarError,
      handleGuardar,
    },
  };
};
