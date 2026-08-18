"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  useCreateBloqueoMutation,
  useGetBloqueos,
  useGetEspecialistas,
} from "@/hooks/api";
import { useHoyPanel } from "@/hooks/common";
import { fechaISO } from "@/lib/formato";

export const useBloqueos = () => {
  const router = useRouter();
  const hoy = useHoyPanel();

  const { data: especialistas = [] } = useGetEspecialistas(undefined, true);
  const [especialistaFiltro, setEspecialistaFiltro] = useState<string>("");

  const especialistaFiltroNum = especialistaFiltro
    ? Number(especialistaFiltro)
    : undefined;
  const { data: bloqueos } = useGetBloqueos(
    especialistaFiltroNum,
    Boolean(especialistaFiltroNum)
  );

  // Formulario de creación de bloqueo
  const [mostrarForm, setMostrarForm] = useState(false);
  const [especialistaForm, setEspecialistaForm] = useState("");
  const [fechaForm, setFechaForm] = useState("");
  const [horaInicioForm, setHoraInicioForm] = useState("09:00");
  const [horaTerminoForm, setHoraTerminoForm] = useState("14:00");
  const [motivoForm, setMotivoForm] = useState("");

  const crearBloqueoMutation = useCreateBloqueoMutation();

  useEffect(() => {
    if (especialistaFiltro || especialistas.length === 0) return;
    setEspecialistaFiltro(String(especialistas[0].id));
    setEspecialistaForm(String(especialistas[0].id));
  }, [especialistas, especialistaFiltro]);

  useEffect(() => {
    if (!hoy || fechaForm) return;
    setFechaForm(fechaISO(hoy));
  }, [hoy, fechaForm]);

  // Actions
  const handleGuardarBloqueo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivoForm.trim() || !especialistaForm) return;

    await crearBloqueoMutation.mutateAsync({
      especialistaId: Number(especialistaForm),
      fecha: fechaForm,
      horaInicio: horaInicioForm,
      horaFin: horaTerminoForm,
      motivo: motivoForm.trim(),
    });

    setEspecialistaFiltro(especialistaForm);
    setMotivoForm("");
    setMostrarForm(false);
  };

  const handleVolver = () => router.push("/panel/agenda");
  const handleAbrirForm = () => setMostrarForm(true);
  const handleCerrarForm = () => setMostrarForm(false);

  return {
    // Data
    hoy,
    especialistas,
    especialistaFiltro,
    bloqueos: bloqueos ?? null,
    mostrarForm,
    especialistaForm,
    fechaForm,
    horaInicioForm,
    horaTerminoForm,
    motivoForm,
    guardando: crearBloqueoMutation.isPending,

    // Actions
    actions: {
      setEspecialistaFiltro,
      setEspecialistaForm,
      setFechaForm,
      setHoraInicioForm,
      setHoraTerminoForm,
      setMotivoForm,
      handleGuardarBloqueo,
      handleVolver,
      handleAbrirForm,
      handleCerrarForm,
    },
  };
};
