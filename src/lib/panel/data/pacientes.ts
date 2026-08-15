import { PacienteResponse } from "@/models/responses";
import { pacienteService } from "@/services";

import { Convenio, Paciente } from "../domain/tipos";
import { CONVENIOS } from "./_seed/convenios";
import { PACIENTES } from "./_seed/pacientes";

export interface PacienteResuelto extends Paciente {
  convenio?: Convenio;
}

function mapBackendDtoToResuelto(dto: PacienteResponse): PacienteResuelto {
  return {
    id: String(dto.id),
    nombre: dto.nombre,
    apellido: dto.apellido,
    rut: dto.rut || "",
    correo: dto.email || "",
    telefono: dto.telefono || "",
    convenioId: undefined,
    origenRegistro: dto.origenRegistro === "web" ? "web" : "manual",
    creadoHaceDias: 0,
    convenio: dto.convenio
      ? { id: dto.convenio, nombre: dto.convenio }
      : undefined,
  };
}

export async function listPacientes(filtro = ""): Promise<PacienteResuelto[]> {
  try {
    const res = await pacienteService.getAll(filtro);
    const apiData = res.data.data;
    if (apiData.length > 0) {
      return apiData.map(mapBackendDtoToResuelto);
    }
  } catch {
    // Error backend
  }

  // Fallback a seed data
  const normalizar = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const termino = normalizar(filtro.trim());

  return PACIENTES.map(p => ({
    ...p,
    convenio: p.convenioId
      ? CONVENIOS.find(c => c.id === p.convenioId)
      : undefined,
  })).filter(p => {
    if (!termino) return true;
    const nombreCompleto = normalizar(`${p.nombre} ${p.apellido}`);
    const rut = p.rut.toLowerCase();
    return nombreCompleto.includes(termino) || rut.includes(termino);
  });
}

export async function buscarPacientes(
  termino: string
): Promise<PacienteResuelto[]> {
  return listPacientes(termino);
}

export async function getPaciente(
  id: string
): Promise<PacienteResuelto | undefined> {
  try {
    const numId = parseInt(id.replace(/\D/g, ""), 10);
    if (!isNaN(numId)) {
      const res = await pacienteService.getById(numId);
      if (res.data.data) return mapBackendDtoToResuelto(res.data.data);
    }
  } catch {
    // Error backend
  }

  const pSeed = PACIENTES.find(p => p.id === id);
  if (pSeed) {
    return {
      ...pSeed,
      convenio: pSeed.convenioId
        ? CONVENIOS.find(c => c.id === pSeed.convenioId)
        : undefined,
    };
  }
  return undefined;
}

export async function pacienteConRut(
  rut: string
): Promise<PacienteResuelto | undefined> {
  try {
    const res = await pacienteService.verificarRut(rut);
    if (res.data.data.existe && res.data.data.paciente) {
      return mapBackendDtoToResuelto(res.data.data.paciente);
    }
  } catch {
    // Error backend
  }

  const limpia = rut.trim().toLowerCase();
  const todos = await listPacientes();
  return todos.find(p => p.rut.trim().toLowerCase() === limpia);
}

export const RUT_DEMO_YA_EXISTENTE = "19.876.543-2";

export async function totalPacientes(): Promise<number> {
  try {
    const res = await pacienteService.getAll();
    if (res.data.data.length > 0) return res.data.data.length;
  } catch {
    // Error backend
  }
  return PACIENTES.length;
}
