import { FichaResponse, FichaResumenResponse } from "@/models/responses";
import { fichaService } from "@/services";

import { Ficha } from "../domain/tipos";
import { FICHAS } from "./_seed/fichas";
import { CitaResuelta, getCita } from "./citas";
import { getPaciente, PacienteResuelto } from "./pacientes";
import { fechaDesdeOffset } from "./resolver";

export interface FichaResuelta extends Omit<
  Ficha,
  "pacienteId" | "citaId" | "creadaOffsetDias"
> {
  creadaEn: Date;
  paciente: PacienteResuelto;
  cita: CitaResuelta;
}

function tipoLegible(dto: { tipo: string; tipoNombre?: string }): string {
  return (
    dto.tipoNombre ||
    (dto.tipo === "Recomendacion"
      ? "Recomendación de Masoterapia"
      : "Ficha Clínica")
  );
}

function pacienteVacio(id: string): PacienteResuelto {
  return {
    id,
    nombre: "Paciente",
    apellido: "",
    rut: "",
    correo: "",
    telefono: "",
    origenRegistro: "manual",
    creadoHaceDias: 0,
  };
}

function citaVacia(id: string, paciente: PacienteResuelto): CitaResuelta {
  return {
    id,
    servicio: "kinesiologia",
    horaInicio: "09:00",
    horaTermino: "10:00",
    estado: "atendida",
    origen: "manual",
    fecha: new Date(),
    creadaEn: new Date(),
    paciente,
    especialista: {
      id: "1",
      nombre: "Especialista",
      cargo: "Profesional",
      servicios: [],
    },
    historial: [],
  };
}

// El listado (FichaResumenResponse) trae datos de paciente/fecha pero no
// contenido ni adjuntos; el detalle (FichaResponse) es al revés. Se arman
// vistas resueltas distintas según cuál llegó.
function mapResumenAResuelta(dto: FichaResumenResponse): FichaResuelta {
  const paciente: PacienteResuelto = {
    id: String(dto.pacienteId),
    nombre: dto.pacienteNombre.split(" ")[0] || "Paciente",
    apellido: dto.pacienteNombre.split(" ").slice(1).join(" "),
    rut: dto.pacienteRut || "",
    correo: "",
    telefono: "",
    origenRegistro: "manual",
    creadoHaceDias: 0,
  };
  return {
    id: String(dto.id),
    formatoId: "general",
    tipo: tipoLegible(dto),
    registradaPor: dto.creadoPorNombre || `Usuario #${dto.creadoPorUsuarioId}`,
    creadaEn: new Date(dto.createdAt),
    contenido: {},
    adjuntos: [],
    paciente,
    cita: {
      ...citaVacia(String(dto.citaId), paciente),
      fecha: new Date(dto.fechaAtencion),
      creadaEn: new Date(dto.createdAt),
    },
  };
}

async function mapDetalleAResuelta(dto: FichaResponse): Promise<FichaResuelta> {
  const citaId = String(dto.citaId);
  const cita = (await getCita(citaId)) || citaVacia(citaId, pacienteVacio("1"));
  return {
    id: String(dto.id),
    formatoId: "general",
    tipo: tipoLegible(dto),
    registradaPor: `Usuario #${dto.creadoPorUsuarioId}`,
    creadaEn: new Date(dto.createdAt),
    contenido: dto.contenido || {},
    adjuntos: dto.adjuntos ? dto.adjuntos.map(a => a.nombreOriginal) : [],
    paciente: cita.paciente,
    cita,
  };
}

export interface FiltroFichas {
  termino?: string;
  tipo?: string;
  desde?: Date;
  hasta?: Date;
}

async function resolverFichaSeed(
  ficha: Ficha,
  hoy: Date
): Promise<FichaResuelta> {
  const { pacienteId, citaId, creadaOffsetDias, ...resto } = ficha;
  const paciente = (await getPaciente(pacienteId)) || pacienteVacio(pacienteId);
  const cita = (await getCita(citaId, hoy)) || citaVacia(citaId, paciente);

  return {
    ...resto,
    creadaEn: fechaDesdeOffset(hoy, creadaOffsetDias),
    paciente,
    cita,
  };
}

export async function listFichas(
  _hoy?: Date,
  filtro: FiltroFichas = {}
): Promise<FichaResuelta[]> {
  const refHoy = _hoy ?? new Date();

  try {
    const res = await fichaService.getAll({
      busqueda: filtro.termino,
      tipoFicha: filtro.tipo,
      fechaDesde: filtro.desde
        ? filtro.desde.toISOString().split("T")[0]
        : undefined,
      fechaHasta: filtro.hasta
        ? filtro.hasta.toISOString().split("T")[0]
        : undefined,
    });
    const items = res.data.data.items;
    if (items.length > 0) {
      return items.map(mapResumenAResuelta);
    }
  } catch {
    // Error backend
  }

  const todas = await Promise.all(
    FICHAS.map(f => resolverFichaSeed(f, refHoy))
  );
  return todas.filter(f => {
    if (filtro.termino) {
      const t = filtro.termino.toLowerCase();
      const match =
        f.paciente.nombre.toLowerCase().includes(t) ||
        f.paciente.apellido.toLowerCase().includes(t) ||
        f.paciente.rut.toLowerCase().includes(t);
      if (!match) return false;
    }
    if (filtro.tipo && f.tipo !== filtro.tipo) return false;
    return true;
  });
}

export async function getFicha(
  id: string,
  hoy?: Date
): Promise<FichaResuelta | undefined> {
  const refHoy = hoy ?? new Date();

  try {
    const numId = parseInt(id.replace(/\D/g, ""), 10);
    if (!isNaN(numId)) {
      const res = await fichaService.getById(numId);
      return await mapDetalleAResuelta(res.data.data);
    }
  } catch {
    // Error
  }

  const seed = FICHAS.find(f => f.id === id);
  if (seed) return resolverFichaSeed(seed, refHoy);
  return undefined;
}

export async function fichasDelPaciente(
  pacienteId: string,
  _hoy?: Date
): Promise<FichaResuelta[]> {
  const refHoy = _hoy ?? new Date();

  try {
    const numId = parseInt(pacienteId.replace(/\D/g, ""), 10);
    if (!isNaN(numId)) {
      const res = await fichaService.getHistorialPorPaciente(numId);
      const data = res.data.data;
      if (data.length > 0) {
        return Promise.all(data.map(mapDetalleAResuelta));
      }
    }
  } catch {
    // Error backend
  }

  const todas = await Promise.all(
    FICHAS.map(f => resolverFichaSeed(f, refHoy))
  );
  return todas.filter(f => f.paciente.id === pacienteId);
}

export async function fichaDeLaCita(
  citaId: string,
  _hoy?: Date
): Promise<FichaResuelta | undefined> {
  const refHoy = _hoy ?? new Date();

  try {
    const numId = parseInt(citaId.replace(/\D/g, ""), 10);
    if (!isNaN(numId)) {
      const res = await fichaService.getAll();
      const hallada = res.data.data.items.find(f => f.citaId === numId);
      if (hallada) return mapResumenAResuelta(hallada);
    }
  } catch {
    // Error backend
  }

  const seed = FICHAS.find(f => f.citaId === citaId);
  if (seed) return resolverFichaSeed(seed, refHoy);
  return undefined;
}

export async function totalFichas(): Promise<number> {
  try {
    const res = await fichaService.getAll();
    return res.data.data.total;
  } catch {
    // Error backend
  }
  return FICHAS.length;
}
