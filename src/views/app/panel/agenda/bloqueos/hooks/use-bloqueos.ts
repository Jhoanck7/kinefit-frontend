"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useGetEspecialistas } from "@/hooks/api";
import { useHoyPanel } from "@/hooks/common";
import {
  crearBloqueo,
  listBloqueosEspecialista,
} from "@/lib/panel/data/bloqueos";
import { BloqueoResuelto } from "@/lib/panel/data/citas";
import { fechaISO } from "@/lib/formato";

export const useBloqueos = () => {
  const router = useRouter();
  const hoy = useHoyPanel();

  const { data: especialistas = [] } = useGetEspecialistas(undefined, true);
  const [especialistaFiltro, setEspecialistaFiltro] = useState<string>("");
  const [bloqueos, setBloqueos] = useState<BloqueoResuelto[] | null>(null);

  // Formulario de creación de bloqueo
  const [mostrarForm, setMostrarForm] = useState(false);
  const [especialistaForm, setEspecialistaForm] = useState("");
  const [fechaForm, setFechaForm] = useState("");
  const [horaInicioForm, setHoraInicioForm] = useState("09:00");
  const [horaTerminoForm, setHoraTerminoForm] = useState("14:00");
  const [motivoForm, setMotivoForm] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (especialistaFiltro || especialistas.length === 0) return;
    setEspecialistaFiltro(String(especialistas[0].id));
    setEspecialistaForm(String(especialistas[0].id));
  }, [especialistas, especialistaFiltro]);

  useEffect(() => {
    if (!hoy || !especialistaFiltro) return;
    listBloqueosEspecialista(especialistaFiltro, hoy).then(datos => {
      if (!fechaForm) setFechaForm(fechaISO(hoy));
      setBloqueos(datos);
    });
  }, [hoy, especialistaFiltro, fechaForm]);

  // Actions
  const handleGuardarBloqueo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoy || !motivoForm.trim()) return;

    setGuardando(true);
    try {
      const fechaObjeto = new Date(`${fechaForm}T00:00:00`);

      const nuevo = await crearBloqueo({
        especialistaId: especialistaForm,
        fecha: fechaObjeto,
        horaInicio: horaInicioForm,
        horaTermino: horaTerminoForm,
        motivo: motivoForm.trim(),
      });

      if (especialistaFiltro === especialistaForm) {
        setBloqueos(prev => [nuevo, ...(prev ?? [])]);
      } else {
        setEspecialistaFiltro(especialistaForm);
      }

      setMotivoForm("");
      setMostrarForm(false);
    } finally {
      setGuardando(false);
    }
  };

  const handleVolver = () => router.push("/panel/agenda");
  const handleAbrirForm = () => setMostrarForm(true);
  const handleCerrarForm = () => setMostrarForm(false);

  return {
    // Data
    hoy,
    especialistas,
    especialistaFiltro,
    bloqueos,
    mostrarForm,
    especialistaForm,
    fechaForm,
    horaInicioForm,
    horaTerminoForm,
    motivoForm,
    guardando,

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
