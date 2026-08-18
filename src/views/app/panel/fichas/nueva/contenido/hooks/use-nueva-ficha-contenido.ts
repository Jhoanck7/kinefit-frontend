"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useGetCita, useGetFormatos } from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import { fichaService } from "@/services";
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

  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const opcionesFormato = formatosDisponibles.map(f => ({
    id: f.id,
    titulo: f.nombre,
  }));
  const formato = formatosDisponibles.find(f => f.id === formatoId) ?? null;
  const nombreFormato = formato?.nombre;

  // Actions
  const handleCambiarCampo = (
    campoId: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

    setGuardando(true);
    setErrorMsg(null);

    try {
      const res = await fichaService.create({
        citaId: Number(citaId),
        tipo:
          formatoId === "fmt-masoterapia" ? "Recomendacion" : "FichaClinica",
        contenido: (contenido as Record<string, string>) || {},
      });
      const creada = res.data.data;

      if (adjuntos && adjuntos.length > 0) {
        for (const nombreArch of adjuntos) {
          try {
            const dummyFile = new File(["contenido"], nombreArch, {
              type: "text/plain",
            });
            await fichaService.subirAdjunto(creada.id, dummyFile);
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
    } finally {
      setGuardando(false);
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
    guardando,
    errorMsg,
    nombreFormato,

    // Actions
    actions: {
      setFormato,
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
