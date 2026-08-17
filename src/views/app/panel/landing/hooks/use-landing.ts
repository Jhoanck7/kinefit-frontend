"use client";

import { useEffect, useState } from "react";

import { CAROUSEL_SLIDES } from "@/lib/utils";
import {
  defaultGoogleReviews,
  defaultLandingConfig,
  defaultProcessSteps,
  GallerySlideItem,
  getLandingConfig,
  GoogleReviewItem,
  LandingConfigData,
  ProcessStepItem,
  sincronizarGoogleReviews,
  updateLandingConfig,
} from "@/lib/panel/data/landing-config";

export const useLanding = () => {
  const [formData, setFormData] =
    useState<LandingConfigData>(defaultLandingConfig);
  const [seccionActiva, setSeccionActiva] = useState<string | null>(null);
  const [slides, setSlides] = useState<GallerySlideItem[]>(CAROUSEL_SLIDES);
  const [processSteps, setProcessSteps] =
    useState<ProcessStepItem[]>(defaultProcessSteps);
  const [reviewsList, setReviewsList] =
    useState<GoogleReviewItem[]>(defaultGoogleReviews);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [confirmacionGuardar, setConfirmacionGuardar] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function cargarConfiguracion() {
      try {
        const config = await getLandingConfig();
        setFormData(config);
        if (config.galleryJson) {
          try {
            const parsed = JSON.parse(config.galleryJson);
            if (Array.isArray(parsed) && parsed.length > 0) setSlides(parsed);
          } catch { }
        }
        if (config.processStepsJson) {
          try {
            const parsedSteps = JSON.parse(config.processStepsJson);
            if (Array.isArray(parsedSteps) && parsedSteps.length > 0)
              setProcessSteps(parsedSteps);
          } catch { }
        }
        if (config.reviewsJson) {
          try {
            const parsedReviews = JSON.parse(config.reviewsJson);
            if (Array.isArray(parsedReviews) && parsedReviews.length > 0)
              setReviewsList(parsedReviews);
          } catch { }
        }
      } catch {
        // El error se refleja al usuario únicamente si ocurre durante el guardado.
      } finally {
        setCargando(false);
      }
    }
    cargarConfiguracion();
  }, []);

  function handleChange(field: keyof LandingConfigData, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  // Complejas (Arrays)
  function handleSlideChange(
    index: number,
    field: keyof GallerySlideItem,
    value: unknown
  ) {
    setSlides(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }
  function handleAgregarSlide() {
    setSlides(prev => [
      ...prev,
      { title: "Nuevo Espacio", description: "", image: "", features: [] },
    ]);
  }
  function handleEliminarSlide(index: number) {
    setSlides(prev => prev.filter((_, i) => i !== index));
  }

  function handleProcessStepChange(
    index: number,
    field: keyof ProcessStepItem,
    value: string
  ) {
    setProcessSteps(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }
  function handleAgregarProcessStep() {
    setProcessSteps(prev => [
      ...prev,
      {
        num: String(prev.length + 1),
        title: "Nuevo Paso",
        description: "",
      },
    ]);
  }
  function handleEliminarProcessStep(index: number) {
    setProcessSteps(prev => prev.filter((_, i) => i !== index));
  }

  function handleReviewChange(
    index: number,
    field: keyof GoogleReviewItem,
    value: unknown
  ) {
    setReviewsList(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }
  function handleAgregarReview() {
    setReviewsList(prev => [
      ...prev,
      {
        author: "Paciente Anónimo",
        quote: "",
        rating: 5,
        isVerifiedGoogle: false,
      },
    ]);
  }
  function handleEliminarReview(index: number) {
    setReviewsList(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSincronizarGoogle() {
    setSincronizando(true);
    setErrorMsg(null);
    try {
      const { data, message } = await sincronizarGoogleReviews();
      if (!data) {
        setErrorMsg(message || "No se pudo sincronizar con Google.");
        return;
      }
      setFormData(data);
      if (data.reviewsJson) {
        try {
          const parsedReviews = JSON.parse(data.reviewsJson);
          if (Array.isArray(parsedReviews)) setReviewsList(parsedReviews);
        } catch { }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || "Ocurrió un error al sincronizar con Google.");
    } finally {
      setSincronizando(false);
    }
  }

  function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setConfirmacionGuardar(true);
  }

  async function ejecutarGuardar() {
    setGuardando(true);
    setErrorMsg(null);

    try {
      const dataToSave = {
        ...formData,
        galleryJson: JSON.stringify(slides),
        processStepsJson: JSON.stringify(processSteps),
        reviewsJson: JSON.stringify(reviewsList),
      };
      const res = await updateLandingConfig(dataToSave);
      setFormData(res);
      setConfirmacionGuardar(false);
      setSeccionActiva(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setGuardando(false);
    }
  }

  return {
    // Data
    formData,
    seccionActiva,
    slides,
    processSteps,
    reviewsList,
    cargando,
    guardando,
    sincronizando,
    confirmacionGuardar,
    errorMsg,

    // Actions
    actions: {
      setSeccionActiva,
      setConfirmacionGuardar,
      handleChange,
      handleSlideChange,
      handleAgregarSlide,
      handleEliminarSlide,
      handleProcessStepChange,
      handleAgregarProcessStep,
      handleEliminarProcessStep,
      handleReviewChange,
      handleAgregarReview,
      handleEliminarReview,
      handleSincronizarGoogle,
      handleGuardar,
      ejecutarGuardar,
    },
  };
};
