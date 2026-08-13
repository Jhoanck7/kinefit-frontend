import { Convenio, Paciente } from "../domain/tipos";
import { PACIENTES } from "./_seed/pacientes";
import { CONVENIOS } from "./_seed/convenios";
import { pacienteService, PacienteBackendDto } from "@/lib/services/paciente.service";

export interface PacienteResuelto extends Paciente {
  convenio?: Convenio;
}

function mapBackendDtoToResuelto(dto: PacienteBackendDto): PacienteResuelto {
  return {
    id: String(dto.id),
    nombre: dto.nombre,
    apellido: dto.apellido,
    rut: dto.rut,
    correo: dto.correo || dto.email || "",
    telefono: dto.telefono || "",
    convenioId: dto.convenioId ? String(dto.convenioId) : undefined,
    origenRegistro: dto.origenRegistro === "web" ? "web" : "manual",
    creadoHaceDias: 0,
    convenio: dto.convenioId
      ? { id: String(dto.convenioId), nombre: dto.convenioNombre || "Convenio" }
      : undefined,
  };
}

export async function listPacientes(filtro = ""): Promise<PacienteResuelto[]> {
  try {
    const apiData = await pacienteService.getAll(filtro);
    if (apiData && Array.isArray(apiData) && apiData.length > 0) {
      return apiData.map(mapBackendDtoToResuelto);
    }
  } catch {
    // Error backend
  }

  // Fallback a seed data
  const normalizar = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const termino = normalizar(filtro.trim());

  return PACIENTES.map((p) => ({
    ...p,
    convenio: p.convenioId ? CONVENIOS.find((c) => c.id === p.convenioId) : undefined,
  })).filter((p) => {
    if (!termino) return true;
    const nombreCompleto = normalizar(`${p.nombre} ${p.apellido}`);
    const rut = p.rut.toLowerCase();
    return nombreCompleto.includes(termino) || rut.includes(termino);
  });
}

export async function buscarPacientes(termino: string): Promise<PacienteResuelto[]> {
  return listPacientes(termino);
}

export async function getPaciente(id: string): Promise<PacienteResuelto | undefined> {
  try {
    const numId = parseInt(id.replace(/\D/g, ""), 10);
    if (!isNaN(numId)) {
      const apiData = await pacienteService.getById(numId);
      if (apiData) return mapBackendDtoToResuelto(apiData);
    }
  } catch {
    // Error backend
  }

  const pSeed = PACIENTES.find((p) => p.id === id);
  if (pSeed) {
    return {
      ...pSeed,
      convenio: pSeed.convenioId ? CONVENIOS.find((c) => c.id === pSeed.convenioId) : undefined,
    };
  }
  return undefined;
}

export async function pacienteConRut(rut: string): Promise<PacienteResuelto | undefined> {
  try {
    const res = await pacienteService.verificarRut(rut);
    if (res?.existe && res.paciente) {
      return mapBackendDtoToResuelto(res.paciente);
    }
  } catch {
    // Error backend
  }

  const limpia = rut.trim().toLowerCase();
  const todos = await listPacientes();
  return todos.find((p) => p.rut.trim().toLowerCase() === limpia);
}

export const RUT_DEMO_YA_EXISTENTE = "19.876.543-2";

export async function totalPacientes(): Promise<number> {
  try {
    const todos = await pacienteService.getAll();
    if (todos && Array.isArray(todos) && todos.length > 0) return todos.length;
  } catch {
    // Error backend
  }
  return PACIENTES.length;
}
