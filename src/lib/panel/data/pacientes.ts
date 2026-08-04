import { Convenio, Paciente } from "../domain/tipos";
import { PACIENTES } from "./_seed/pacientes";
import { CONVENIOS } from "./_seed/convenios";

export interface PacienteResuelto extends Paciente {
  convenio?: Convenio;
}

function resolver(paciente: Paciente): PacienteResuelto {
  return {
    ...paciente,
    convenio: paciente.convenioId
      ? CONVENIOS.find((c) => c.id === paciente.convenioId)
      : undefined,
  };
}

function coincide(paciente: Paciente, termino: string): boolean {
  const t = termino.trim().toLowerCase();
  if (!t) return true;
  return (
    paciente.nombre.toLowerCase().includes(t) ||
    paciente.apellido.toLowerCase().includes(t) ||
    paciente.rut.toLowerCase().includes(t) ||
    paciente.correo.toLowerCase().includes(t)
  );
}

export async function listPacientes(filtro = ""): Promise<PacienteResuelto[]> {
  return PACIENTES.filter((p) => coincide(p, filtro)).map(resolver);
}

export async function getPaciente(id: string): Promise<PacienteResuelto | undefined> {
  const paciente = PACIENTES.find((p) => p.id === id);
  return paciente ? resolver(paciente) : undefined;
}

export async function buscarPacientes(termino: string, limite = 6): Promise<PacienteResuelto[]> {
  if (!termino.trim()) return [];
  return PACIENTES.filter((p) => coincide(p, termino)).slice(0, limite).map(resolver);
}

/**
 * Caso guionizado de E.4: un RUT concreto de la semilla dispara la
 * advertencia de "este RUT ya existe" en el registro de paciente nuevo.
 * No es validación real — es un ejemplo fijo para que la especialista
 * evalúe el comportamiento.
 */
export const RUT_DEMO_YA_EXISTENTE = "17.890.123-0";

export async function pacienteConRut(rut: string): Promise<PacienteResuelto | undefined> {
  const paciente = PACIENTES.find((p) => p.rut === rut);
  return paciente ? resolver(paciente) : undefined;
}

export async function totalPacientes(): Promise<number> {
  return PACIENTES.length;
}
