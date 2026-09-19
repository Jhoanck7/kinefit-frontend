"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import {
  useCreateBloqueoMutation,
  useCreateBloqueoParaTodosMutation,
  useGetBloqueos,
  useGetEspecialistas,
} from "@/hooks/api";
import { useHoyPanel } from "@/hooks/common";
import { handleApiError } from "@/lib/api";
import { fechaISO } from "@/lib/formato";

export const useBloqueos = () => {
  const router = useRouter();
  const hoy = useHoyPanel();
  const { data: session } = useSession();
  const esAdministrador = session?.user.rol === "Administrador";

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
  const [paraTodos, setParaTodos] = useState(false);
  const [resultadoParaTodos, setResultadoParaTodos] = useState<string | null>(
    null
  );
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  const crearBloqueoMutation = useCreateBloqueoMutation();
  const crearParaTodosMutation = useCreateBloqueoParaTodosMutation();

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
    if (!motivoForm.trim()) return;
    if (!paraTodos && !especialistaForm) return;

    setErrorGuardar(null);
    setResultadoParaTodos(null);

    try {
      if (paraTodos) {
        const resultado = await crearParaTodosMutation.mutateAsync({
          fecha: fechaForm,
          horaInicio: horaInicioForm,
          horaFin: horaTerminoForm,
          motivo: motivoForm.trim(),
        });
        setResultadoParaTodos(
          resultado.omitidos.length === 0
            ? `Bloqueo aplicado a los ${resultado.creados.length} especialista(s) activo(s).`
            : `Bloqueo aplicado a ${resultado.creados.length} especialista(s). ${resultado.omitidos.length} quedaron fuera por tener una cita en firme en ese rango.`
        );
      } else {
        await crearBloqueoMutation.mutateAsync({
          especialistaId: Number(especialistaForm),
          fecha: fechaForm,
          horaInicio: horaInicioForm,
          horaFin: horaTerminoForm,
          motivo: motivoForm.trim(),
        });
        setEspecialistaFiltro(especialistaForm);
      }
      setMotivoForm("");
      setParaTodos(false);
      setMostrarForm(false);
    } catch (err: unknown) {
      setErrorGuardar(handleApiError(err).message);
    }
  };

  const handleVolver = () => router.push("/panel/agenda");
  const handleAbrirForm = () => setMostrarForm(true);
  const handleCerrarForm = () => {
    setMostrarForm(false);
    setErrorGuardar(null);
  };

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
    esAdministrador,
    paraTodos,
    resultadoParaTodos,
    errorGuardar,
    guardando:
      crearBloqueoMutation.isPending || crearParaTodosMutation.isPending,

    // Actions
    actions: {
      setEspecialistaFiltro,
      setEspecialistaForm,
      setFechaForm,
      setHoraInicioForm,
      setHoraTerminoForm,
      setMotivoForm,
      setParaTodos,
      handleGuardarBloqueo,
      handleVolver,
      handleAbrirForm,
      handleCerrarForm,
    },
  };
};
