import { Ficha } from "../domain/tipos";
import { FICHAS } from "./_seed/fichas";
import { getCita, CitaResuelta } from "./citas";
import { PacienteResuelto } from "./pacientes";
import { getPaciente } from "./pacientes";
import { fechaHoraDesdeOffset } from "./resolver";

export interface FichaResuelta extends Omit<Ficha, "pacienteId" | "citaId" | "creadaOffsetDias"> {
  creadaEn: Date;
  paciente: PacienteResuelto;
  cita: CitaResuelta;
}

async function resolverFicha(ficha: Ficha, hoy: Date): Promise<FichaResuelta> {
  const { pacienteId, citaId, creadaOffsetDias, ...resto } = ficha;
  const paciente = await getPaciente(pacienteId);
  const cita = await getCita(citaId, hoy);
  if (!paciente) throw new Error(`Paciente inexistente en la semilla: ${pacienteId}`);
  if (!cita) throw new Error(`Cita inexistente en la semilla: ${citaId}`);
  return {
    ...resto,
    creadaEn: fechaHoraDesdeOffset(hoy, creadaOffsetDias, "09:00"),
    paciente,
    cita,
  };
}

function coincideConPaciente(ficha: FichaResuelta, termino: string): boolean {
  const t = termino.trim().toLowerCase();
  if (!t) return true;
  const nombreCompleto = `${ficha.paciente.nombre} ${ficha.paciente.apellido}`.toLowerCase();
  return nombreCompleto.includes(t) || ficha.paciente.rut.toLowerCase().includes(t);
}

export interface FiltroFichas {
  termino?: string;
  tipo?: string;
  desde?: Date;
  hasta?: Date;
}

export async function listFichas(hoy: Date, filtro: FiltroFichas = {}): Promise<FichaResuelta[]> {
  const resueltas = await Promise.all(FICHAS.map((f) => resolverFicha(f, hoy)));
  return resueltas
    .filter((f) => coincideConPaciente(f, filtro.termino ?? ""))
    .filter((f) => !filtro.tipo || f.tipo === filtro.tipo)
    .filter((f) => !filtro.desde || f.cita.fecha >= filtro.desde)
    .filter((f) => !filtro.hasta || f.cita.fecha <= filtro.hasta)
    .sort((a, b) => b.creadaEn.getTime() - a.creadaEn.getTime());
}

export async function getFicha(id: string, hoy: Date): Promise<FichaResuelta | undefined> {
  const ficha = FICHAS.find((f) => f.id === id);
  return ficha ? resolverFicha(ficha, hoy) : undefined;
}

export async function fichasDelPaciente(pacienteId: string, hoy: Date): Promise<FichaResuelta[]> {
  const resueltas = await Promise.all(
    FICHAS.filter((f) => f.pacienteId === pacienteId).map((f) => resolverFicha(f, hoy))
  );
  return resueltas.sort((a, b) => b.creadaEn.getTime() - a.creadaEn.getTime());
}

export async function fichaDeLaCita(citaId: string, hoy: Date): Promise<FichaResuelta | undefined> {
  const ficha = FICHAS.find((f) => f.citaId === citaId);
  return ficha ? resolverFicha(ficha, hoy) : undefined;
}

export async function totalFichas(): Promise<number> {
  return FICHAS.length;
}
