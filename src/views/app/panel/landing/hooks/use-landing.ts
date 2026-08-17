"use client";

import { useEffect, useState } from "react";

import {
  useGetLandingConfig,
  useSincronizarGoogleReviewsMutation,
  useUpdateLandingConfigMutation,
} from "@/hooks/api";
import { LandingConfigResponse } from "@/models/responses";

export interface GallerySlideItem {
  title: string;
  description: string;
  image: string;
  features?: string[];
}

export interface ProcessStepItem {
  num: string;
  title: string;
  description: string;
}

export interface GoogleReviewItem {
  author: string;
  role?: string;
  quote: string;
  rating: number;
  date?: string;
  avatarUrl?: string;
  isVerifiedGoogle?: boolean;
}

const DEFAULT_LANDING_CONFIG: LandingConfigResponse = {
  heroTagline: "",
  heroBrandName: "KineFit",
  heroDescription: "Centro de Kinesiología y Fisioterapia Especializada.",
  heroCtaText: "Reservar Cita",
  clinicName: "KineFit Clínica",
  clinicEmail: "contacto@kinefit.cl",
  clinicPhone: "+56 9 1234 5678",
  clinicPhoneRaw: "+56912345678",
  clinicAddress: "Av. Providencia 1234, Oficina 501, Santiago",
  hoursWeekday: "Lunes a Viernes: 08:00 - 20:00",
  hoursSaturday: "Sábados: 09:00 - 14:00",
  socialInstagram: "https://instagram.com/kinefit",
  socialFacebook: "https://facebook.com/kinefit",
  socialWhatsApp: "https://wa.me/56912345678",
  socialTikTok: "https://tiktok.com/@kinefit",
};

export const useLanding = () => {
  const { data: configData, isLoading: cargando } = useGetLandingConfig();
  const updateMutation = useUpdateLandingConfigMutation();
  const sincronizarMutation = useSincronizarGoogleReviewsMutation();

  const [formData, setFormData] = useState<LandingConfigResponse>(DEFAULT_LANDING_CONFIG);
  const [seccionActiva, setSeccionActiva] = useState<string | null>(null);
  const [slides, setSlides] = useState<GallerySlideItem[]>([]);
  const [processSteps, setProcessSteps] = useState<ProcessStepItem[]>([]);
  const [reviewsList, setReviewsList] = useState<GoogleReviewItem[]>([]);
  const [limiteResenas, setLimiteResenas] = useState<number>(5);
  const [confirmacionGuardar, setConfirmacionGuardar] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (configData) {
      setFormData(configData);
      if (configData.galleryJson) {
        try {
          const parsed = JSON.parse(configData.galleryJson);
          if (Array.isArray(parsed)) setSlides(parsed);
        } catch {}
      }
      if (configData.processStepsJson) {
        try {
          const parsedSteps = JSON.parse(configData.processStepsJson);
          if (Array.isArray(parsedSteps)) setProcessSteps(parsedSteps);
        } catch {}
      }
      if (configData.reviewsJson) {
        try {
          const parsedReviews = JSON.parse(configData.reviewsJson);
          if (Array.isArray(parsedReviews)) setReviewsList(parsedReviews);
        } catch {}
      }
    }
  }, [configData]);

  function handleChange(field: keyof LandingConfigResponse, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function handleSlideChange(index: number, field: keyof GallerySlideItem, value: unknown) {
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

  function handleProcessStepChange(index: number, field: keyof ProcessStepItem, value: string) {
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

  function handleReviewChange(index: number, field: keyof GoogleReviewItem, value: unknown) {
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
    setErrorMsg(null);
    try {
      const data = await sincronizarMutation.mutateAsync(limiteResenas);
      if (data) {
        setFormData(data);
        if (data.reviewsJson) {
          try {
            const parsed = JSON.parse(data.reviewsJson);
            if (Array.isArray(parsed)) setReviewsList(parsed);
          } catch {}
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || "Ocurrió un error al sincronizar con Google.");
    }
  }

  function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setConfirmacionGuardar(true);
  }

  async function ejecutarGuardar() {
    setErrorMsg(null);
    try {
      const dataToSave: LandingConfigResponse = {
        ...formData,
        galleryJson: JSON.stringify(slides),
        processStepsJson: JSON.stringify(processSteps),
        reviewsJson: JSON.stringify(reviewsList),
      };
      const res = await updateMutation.mutateAsync(dataToSave);
      setFormData(res);
      setConfirmacionGuardar(false);
      setSeccionActiva(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || "Error al guardar la configuración.");
    }
  }

  return {
    formData,
    seccionActiva,
    slides,
    processSteps,
    reviewsList,
    limiteResenas,
    cargando,
    guardando: updateMutation.isPending,
    sincronizando: sincronizarMutation.isPending,
    confirmacionGuardar,
    errorMsg,

    actions: {
      setSeccionActiva,
      setConfirmacionGuardar,
      setLimiteResenas,
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
