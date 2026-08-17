"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { fechaISO, formatearFechaExtensa } from "@/lib/formato";
import { agendaService, citaService } from "@/services";
import { useNuevaReservaStore } from "@/stores";

export const PASOS_NUEVA_RESERVA = [
  { etiqueta: "Servicio" },
  { etiqueta: "Horario" },
  { etiqueta: "Especialista" },
  { etiqueta: "Paciente" },
  { etiqueta: "Notas y resumen" },
];

export const NOMBRE_SERVICIO: Record<string, string> = {
  embarazadas: "Embarazadas",
  masajes_pareja: "Masajes en pareja (masoterapia)",
  masajes: "Masajes (masoterapia)",
  masajes_premium: "Masajes Premium (masoterapia premium)",
  masajes_reductivos: "Masajes Reductivos",
  voucher_regalo: "Voucher para Regalo",
  kinesiologia: "Kinesiología",
};

// Mismo mapeo dominio→id real usado en la selección de especialista; el enum
// de Servicio del dominio aún no tiene una fuente única compartida con el
// catálogo real de servicios del backend.
const MAPA_SERVICIO_ID: Record<string, number> = {
  masajes: 1,
  kinesiologia: 2,
  embarazadas: 3,
  masajes_pareja: 4,
  masajes_premium: 5,
  masajes_reductivos: 6,
  voucher_regalo: 7,
};

export const useResumenReserva = () => {
  const router = useRouter();
  const {
    fecha,
    hora,
    bloqueHorarioIds,
    pacienteId,
    pacienteNombre,
    especialistaId,
    especialistaNombre,
    servicio,
    notaPaciente,
    notaInterna,
    setNotaPaciente,
    setNotaInterna,
    reiniciar,
  } = useNuevaReservaStore();

  const [confirmarDescarte, setConfirmarDescarte] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const nombreServicio = servicio ? NOMBRE_SERVICIO[servicio] : undefined;

  const filasResumen = [
    {
      etiqueta: "Servicio",
      valor: nombreServicio,
      editar: "/panel/nueva-reserva/servicio",
    },
    {
      etiqueta: "Fecha",
      valor: fecha ? formatearFechaExtensa(fecha) : undefined,
      editar: "/panel/nueva-reserva/horario",
    },
    {
      etiqueta: "Horario",
      valor: hora || undefined,
      editar: "/panel/nueva-reserva/horario",
    },
    {
      etiqueta: "Especialista",
      valor: especialistaNombre || undefined,
      editar: "/panel/nueva-reserva/especialista",
    },
    {
      etiqueta: "Paciente",
      valor: pacienteNombre || undefined,
      editar: "/panel/nueva-reserva/paciente",
    },
  ];

  // Actions
  const handleConfirmarReserva = async () => {
    if (!fecha || !hora || !pacienteId || !servicio) {
      setErrorMsg("Faltan datos obligatorios para registrar la reserva.");
      return;
    }

    setGuardando(true);
    setErrorMsg(null);

    try {
      const numPacienteId = parseInt(pacienteId.replace(/\D/g, ""), 10) || 1;
      const numEspecialistaId = especialistaId
        ? parseInt(especialistaId.replace(/\D/g, ""), 10) || 1
        : 1;
      const numServicioId = MAPA_SERVICIO_ID[servicio] || 2;
      const fechaStr = fechaISO(fecha);

      let targetBloqueIds = bloqueHorarioIds;

      if (!targetBloqueIds || targetBloqueIds.length === 0) {
        const agendaRes = await agendaService.getAgenda(
          [numEspecialistaId],
          fechaStr,
          fechaStr
        );
        const dataArr = agendaRes.data.data;
        const hBuscada = hora.substring(0, 5);
        const idx = dataArr.findIndex(
          b => b.horaInicio && b.horaInicio.substring(0, 5) === hBuscada
        );
        
        const DURACION_MINUTOS_SERVICIO: Record<string, number> = {
          embarazadas: 60,
          masajes_pareja: 60,
          masajes: 30,
          masajes_premium: 60,
          masajes_reductivos: 60,
          voucher_regalo: 60,
          kinesiologia: 45,
        };
        const duracionMin = servicio ? (DURACION_MINUTOS_SERVICIO[servicio] ?? 60) : 60;
        const bloquesRequeridos = Math.ceil(duracionMin / 30);
        
        if (idx !== -1 && idx + bloquesRequeridos <= dataArr.length) {
          const ids: number[] = [];
          for (let i = 0; i < bloquesRequeridos; i++) {
            ids.push(dataArr[idx + i].id);
          }
          targetBloqueIds = ids;
        }
      }

      if (!targetBloqueIds || targetBloqueIds.length === 0) {
        throw new Error(
          "No se encontró el bloque horario seleccionado para esa fecha y hora. Re-selecciona el horario."
        );
      }

      await citaService.createManual({
        pacienteId: numPacienteId,
        especialistaId: numEspecialistaId,
        servicioId: numServicioId,
        bloqueHorarioIds: targetBloqueIds,
        notaPaciente: notaPaciente || undefined,
        notaInterna: notaInterna || undefined,
      });

      router.push("/panel/nueva-reserva/listo");
    } catch (err: unknown) {
      console.error("Error al registrar la cita en Backend:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Ocurrió un error al guardar la cita.";
      setErrorMsg(msg);
    } finally {
      setGuardando(false);
    }
  };

  const handleAbrirConfirmarDescarte = () => setConfirmarDescarte(true);
  const handleCerrarConfirmarDescarte = () => setConfirmarDescarte(false);
  const handleVolver = () => router.push("/panel/nueva-reserva/paciente");
  const handleDescartar = () => {
    reiniciar();
    router.push("/panel/agenda");
  };

  return {
    // Data
    notaPaciente,
    notaInterna,
    filasResumen,
    confirmarDescarte,
    guardando,
    errorMsg,

    // Actions
    actions: {
      setNotaPaciente,
      setNotaInterna,
      handleConfirmarReserva,
      handleAbrirConfirmarDescarte,
      handleCerrarConfirmarDescarte,
      handleVolver,
      handleDescartar,
    },
  };
};
