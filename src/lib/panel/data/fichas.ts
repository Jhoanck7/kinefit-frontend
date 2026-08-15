import { FichaBackendDto, fichaService } from "@/lib/services/ficha.service";

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

function mapBackendDtoToResuelta(dto: FichaBackendDto): FichaResuelta {
  const fechaCita = dto.citaFecha ? new Date(dto.citaFecha) : new Date();
  const fechaCreacionRaw = dto.createdAt || dto.creadaEn;
  const fechaCreacion = fechaCreacionRaw
    ? new Date(fechaCreacionRaw)
    : fechaCita;
  const nombreCreador =
    dto.creadoPorNombre ||
    dto.registradaPor ||
    (dto.creadoPorUsuarioId
      ? `Usuario #${dto.creadoPorUsuarioId}`
      : "Personal de Salud");

  return {
    id: String(dto.id),
    formatoId: dto.formatoId || "general",
    tipo:
      dto.tipoFicha ||
      (dto.tipo === "Recomendacion"
        ? "Recomendación de Masoterapia"
        : "Ficha Clínica"),
    registradaPor: nombreCreador,
    creadaEn: fechaCreacion,
    contenido: dto.contenido || {},
    adjuntos: dto.adjuntos ? dto.adjuntos.map(a => a.nombreOriginal) : [],
    paciente: {
      id: String(dto.pacienteId || 1),
      nombre: dto.pacienteNombre
        ? dto.pacienteNombre.split(" ")[0]
        : "Paciente",
      apellido: dto.pacienteNombre
        ? dto.pacienteNombre.split(" ").slice(1).join(" ")
        : "",
      rut: dto.pacienteRut || "",
      correo: "",
      telefono: "",
      origenRegistro: "manual",
      creadoHaceDias: 0,
    },
    cita: {
      id: String(dto.citaId),
      servicio: dto.servicioNombre?.toLowerCase().includes("kinesiol")
        ? "kinesiologia"
        : "masajes",
      horaInicio: dto.citaHoraInicio || "09:00",
      horaTermino: dto.citaHoraTermino || "10:00",
      estado: "atendida",
      origen: "manual",
      fecha: fechaCita,
      creadaEn: fechaCita,
      paciente: {
        id: String(dto.pacienteId || 1),
        nombre: dto.pacienteNombre
          ? dto.pacienteNombre.split(" ")[0]
          : "Paciente",
        apellido: dto.pacienteNombre
          ? dto.pacienteNombre.split(" ").slice(1).join(" ")
          : "",
        rut: dto.pacienteRut || "",
        correo: "",
        telefono: "",
        origenRegistro: "manual",
        creadoHaceDias: 0,
      },
      especialista: {
        id: String(dto.especialistaId || 1),
        nombre: nombreCreador,
        cargo: "Especialista",
        servicios: [],
      },
      historial: [],
    },
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
  const paciente = (await getPaciente(pacienteId)) || {
    id: pacienteId,
    nombre: "Paciente",
    apellido: "",
    rut: "12.345.678-9",
    correo: "",
    telefono: "",
    origenRegistro: "manual",
    creadoHaceDias: 0,
  };

  const cita = (await getCita(citaId, hoy)) || {
    id: citaId,
    servicio: "kinesiologia",
    horaInicio: "10:00",
    horaTermino: "10:45",
    estado: "atendida",
    origen: "manual",
    fecha: hoy,
    creadaEn: hoy,
    paciente,
    especialista: {
      id: "esp-valeria",
      nombre: "Valeria Araneda",
      cargo: "Kinesióloga",
      servicios: ["kinesiologia"],
    },
    historial: [],
  };

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
    if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(mapBackendDtoToResuelta);
    }
  } catch {
    // Error backend
  }

  // Fallback a seed data
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
      const apiData = await fichaService.getById(numId);
      if (apiData) {
        const resuelta = mapBackendDtoToResuelta(apiData);
        return resuelta;
      }
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
    const apiData = await fichaService.getHistorialPorPaciente(pacienteId);
    if (apiData && Array.isArray(apiData) && apiData.length > 0) {
      return apiData.map(mapBackendDtoToResuelta);
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
      const hallada = res?.data?.find(f => f.citaId === numId);
      if (hallada) return mapBackendDtoToResuelta(hallada);
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
    if (res?.total !== undefined && res.total > 0) return res.total;
    if (res?.data && Array.isArray(res.data) && res.data.length > 0)
      return res.data.length;
  } catch {
    // Error backend
  }
  return FICHAS.length;
}
