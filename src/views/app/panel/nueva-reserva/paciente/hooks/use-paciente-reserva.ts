"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  buscarPacientes,
  getPaciente,
  PacienteResuelto,
} from "@/lib/panel/data/pacientes";
import { useNuevaReservaStore } from "@/lib/store/useNuevaReservaStore";

export const PASOS_NUEVA_RESERVA = [
  { etiqueta: "Servicio" },
  { etiqueta: "Horario" },
  { etiqueta: "Especialista" },
  { etiqueta: "Paciente" },
  { etiqueta: "Notas y resumen" },
];

export const NOMBRE_SERVICIO: Record<string, string> = {
  embarazadas: "Embarazadas",
  masajes_pareja: "Masajes en pareja",
  masajes: "Masajes (masoterapia)",
  masajes_premium: "Masajes Premium",
  masajes_reductivos: "Masajes Reductivos",
  voucher_regalo: "Voucher para Regalo",
  kinesiologia: "Kinesiología",
};

export const usePacienteReserva = () => {
  const router = useRouter();
  const {
    fecha,
    hora,
    pacienteId,
    pacienteNombre,
    especialistaNombre,
    servicio,
    setPaciente,
  } = useNuevaReservaStore();

  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<PacienteResuelto[]>([]);
  const [buscado, setBuscado] = useState(false);
  const [pacienteConfirmado, setPacienteConfirmado] =
    useState<PacienteResuelto | null>(null);

  useEffect(() => {
    if (!busqueda.trim()) return;
    buscarPacientes(busqueda).then(r => {
      setResultados(r);
      setBuscado(true);
    });
  }, [busqueda]);

  useEffect(() => {
    if (pacienteId && !pacienteId.startsWith("temp-")) {
      getPaciente(pacienteId).then(p => setPacienteConfirmado(p ?? null));
    }
  }, [pacienteId]);

  const nombreServicio = servicio
    ? (NOMBRE_SERVICIO[servicio] ?? servicio)
    : undefined;

  // Actions
  const handleBusquedaChange = (val: string) => {
    setBusqueda(val);
    if (!val.trim()) {
      setResultados([]);
      setBuscado(false);
    }
  };

  const handleSeleccionar = (paciente: PacienteResuelto) => {
    setPaciente(paciente.id, `${paciente.nombre} ${paciente.apellido}`);
    setPacienteConfirmado(paciente);
    setBusqueda("");
    setResultados([]);
  };

  const handleCambiarPaciente = () => {
    setPaciente("", "");
    setPacienteConfirmado(null);
  };

  const handleRegistrarNuevo = () =>
    router.push("/panel/pacientes/nuevo?retorno=/panel/nueva-reserva/paciente");
  const handleVolver = () => router.push("/panel/nueva-reserva/especialista");
  const handleCancelar = () => router.push("/panel/agenda");
  const handleContinuar = () => router.push("/panel/nueva-reserva/resumen");

  return {
    // Data
    fecha,
    hora,
    pacienteId,
    pacienteNombre,
    especialistaNombre,
    nombreServicio,
    busqueda,
    resultados,
    buscado,
    pacienteConfirmado,

    // Actions
    actions: {
      handleBusquedaChange,
      handleSeleccionar,
      handleCambiarPaciente,
      handleRegistrarNuevo,
      handleVolver,
      handleCancelar,
      handleContinuar,
    },
  };
};
