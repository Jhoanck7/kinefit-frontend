"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  crearBloqueo,
  listBloqueosEspecialista,
} from "@/lib/panel/data/bloqueos";
import { BloqueoResuelto } from "@/lib/panel/data/citas";
import { listEspecialistas } from "@/lib/panel/data/especialistas";
import { fechaISO } from "@/lib/panel/domain/formato";
import { Especialista } from "@/lib/panel/domain/tipos";
import { useHoyPanel } from "@/lib/panel/reloj";

export const useBloqueos = () => {
  const router = useRouter();
  const hoy = useHoyPanel();

  const [especialistas, setEspecialistas] = useState<Especialista[]>([]);
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
    listEspecialistas().then(lista => {
      setEspecialistas(lista);
      if (lista.length > 0) {
        setEspecialistaFiltro(lista[0].id);
        setEspecialistaForm(lista[0].id);
      }
    });
  }, []);

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
