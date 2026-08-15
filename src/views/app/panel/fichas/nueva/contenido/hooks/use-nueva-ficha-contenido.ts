"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CitaResuelta, getCita } from "@/lib/panel/data/citas";
import {
  FormatoResuelto,
  getFormato,
  listFormatos,
} from "@/lib/panel/data/formatos";
import { useHoyPanel } from "@/lib/panel/reloj";
import { useNuevaFichaStore } from "@/lib/store/useNuevaFichaStore";
import { fichaService } from "@/services";

export const useNuevaFichaContenido = () => {
  const router = useRouter();
  const hoy = useHoyPanel();
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

  const [cita, setCita] = useState<CitaResuelta | null>(null);
  const [formato, setFormatoResuelto] = useState<FormatoResuelto | null>(null);
  const [formatosDisponibles, setFormatosDisponibles] = useState<
    FormatoResuelto[]
  >([]);
  const [opcionesFormato, setOpcionesFormato] = useState<
    { id: string; titulo: string }[]
  >([]);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!citaId || !hoy) return;
    getCita(citaId, hoy).then(c => {
      if (c) setCita(c);
    });
  }, [citaId, hoy]);

  useEffect(() => {
    if (!hoy) return;
    listFormatos(hoy).then(lista => {
      setFormatosDisponibles(lista);
      const opciones = lista.map(f => ({ id: f.id, titulo: f.nombre }));
      setOpcionesFormato(opciones);
      if (lista.length > 0 && !formatoId) {
        setFormato(lista[0].id);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoy]);

  useEffect(() => {
    if (!formatoId) {
      Promise.resolve().then(() => setFormatoResuelto(null));
      return;
    }
    const hallado = formatosDisponibles.find(f => f.id === formatoId);
    if (hallado) {
      Promise.resolve().then(() => setFormatoResuelto(hallado));
    } else if (hoy) {
      getFormato(formatoId, hoy).then(resultado =>
        setFormatoResuelto(resultado ?? null)
      );
    }
  }, [formatoId, formatosDisponibles, hoy]);

  const nombreFormato =
    opcionesFormato.find(o => o.id === formatoId)?.titulo || formato?.nombre;

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
      const numCitaId = parseInt(citaId.replace(/\D/g, ""), 10) || 1;

      const res = await fichaService.create({
        citaId: numCitaId,
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
      const msg =
        err instanceof Error
          ? err.message
          : "Ocurrió un error al guardar la ficha en el backend.";
      setErrorMsg(msg);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } finally {
      setGuardando(false);
    }
  };

  return {
    // Data
    hoy,
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
