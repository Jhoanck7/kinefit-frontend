import { Cita, Especialista, Bloqueo } from "../domain/tipos";
import { CITAS } from "./_seed/citas";
import { BLOQUEOS } from "./_seed/bloqueos";
import { PACIENTES } from "./_seed/pacientes";
import { ESPECIALISTAS } from "./_seed/especialistas";
import { CONVENIOS } from "./_seed/convenios";
import { fechaDesdeOffset, fechaHoraDesdeOffset } from "./resolver";
import { fechaISO } from "../domain/formato";
import { PacienteResuelto } from "./pacientes";

export interface CambioEstadoResuelto {
  estado: Cita["estado"];
  fecha: Date;
  responsable: string;
  motivo?: string;
}

export interface CitaResuelta
  extends Omit<Cita, "offsetDias" | "creadaOffsetDias" | "creadaHora" | "historial" | "pacienteId" | "especialistaId"> {
  fecha: Date;
  creadaEn: Date;
  paciente: PacienteResuelto;
  especialista: Especialista;
  historial: CambioEstadoResuelto[];
}

export interface BloqueoResuelto extends Omit<Bloqueo, "offsetDias" | "especialistaId"> {
  fecha: Date;
  especialista: Especialista;
}

function resolverPaciente(id: string): PacienteResuelto {
  const paciente = PACIENTES.find((p) => p.id === id);
  if (!paciente) throw new Error(`Paciente inexistente en la semilla: ${id}`);
  return {
    ...paciente,
    convenio: paciente.convenioId ? CONVENIOS.find((c) => c.id === paciente.convenioId) : undefined,
  };
}

function resolverEspecialista(id: string): Especialista {
  const especialista = ESPECIALISTAS.find((e) => e.id === id);
  if (!especialista) throw new Error(`Especialista inexistente en la semilla: ${id}`);
  return especialista;
}

function resolverCita(cita: Cita, hoy: Date): CitaResuelta {
  const { pacienteId, especialistaId, offsetDias, creadaOffsetDias, creadaHora, historial, ...resto } = cita;
  return {
    ...resto,
    fecha: fechaHoraDesdeOffset(hoy, offsetDias, cita.horaInicio),
    creadaEn: fechaHoraDesdeOffset(hoy, creadaOffsetDias, creadaHora),
    paciente: resolverPaciente(pacienteId),
    especialista: resolverEspecialista(especialistaId),
    historial: historial.map((h) => ({
      estado: h.estado,
      fecha: fechaHoraDesdeOffset(hoy, h.haceDias, h.hora),
      responsable: h.responsable,
      motivo: h.motivo,
    })),
  };
}

function resolverBloqueo(bloqueo: Bloqueo, hoy: Date): BloqueoResuelto {
  const { especialistaId, offsetDias, ...resto } = bloqueo;
  return {
    ...resto,
    fecha: fechaDesdeOffset(hoy, offsetDias),
    especialista: resolverEspecialista(especialistaId),
  };
}

/** La jornada de un especialista para una fecha concreta (RF-AGD-001). */
export async function getAgendaDia(
  especialistaId: string,
  fecha: Date,
  hoy: Date
): Promise<{ citas: CitaResuelta[]; bloqueos: BloqueoResuelto[] }> {
  const fechaObjetivo = fechaISO(fecha);
  const citas = CITAS.filter(
    (c) =>
      c.especialistaId === especialistaId &&
      fechaISO(fechaDesdeOffset(hoy, c.offsetDias)) === fechaObjetivo
  )
    .map((c) => resolverCita(c, hoy))
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  const bloqueos = BLOQUEOS.filter(
    (b) =>
      b.especialistaId === especialistaId &&
      fechaISO(fechaDesdeOffset(hoy, b.offsetDias)) === fechaObjetivo
  ).map((b) => resolverBloqueo(b, hoy));

  return { citas, bloqueos };
}

export async function getCita(id: string, hoy: Date): Promise<CitaResuelta | undefined> {
  const cita = CITAS.find((c) => c.id === id);
  return cita ? resolverCita(cita, hoy) : undefined;
}

/** Historial cronológico descendente de citas de un paciente (RF-PAC-022). */
export async function historialPaciente(pacienteId: string, hoy: Date): Promise<CitaResuelta[]> {
  return CITAS.filter((c) => c.pacienteId === pacienteId)
    .map((c) => resolverCita(c, hoy))
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
}

/**
 * Contadores de actividad del paciente (RF-PAC-021), derivados del historial
 * y nunca escritos aparte (§5.4 regla 2): es el mismo dato leído dos veces.
 */
export async function contadoresPaciente(
  pacienteId: string,
  hoy: Date
): Promise<{ atendidas: number; canceladas: number; noAsistidas: number }> {
  const historial = await historialPaciente(pacienteId, hoy);
  return {
    atendidas: historial.filter((c) => c.estado === "atendida").length,
    canceladas: historial.filter((c) => c.estado === "cancelada").length,
    noAsistidas: historial.filter((c) => c.estado === "no_asistida").length,
  };
}

/** Reservas de un paciente con indicador de si ya tienen ficha (NF1-4). */
export async function reservasDelPaciente(
  pacienteId: string,
  hoy: Date
): Promise<CitaResuelta[]> {
  return historialPaciente(pacienteId, hoy);
}

export async function listCitasDelDia(fecha: Date, hoy: Date): Promise<CitaResuelta[]> {
  const fechaObjetivo = fechaISO(fecha);
  return CITAS.filter((c) => fechaISO(fechaDesdeOffset(hoy, c.offsetDias)) === fechaObjetivo).map(
    (c) => resolverCita(c, hoy)
  );
}
