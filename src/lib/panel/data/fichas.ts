import { Ficha } from "../domain/tipos";
import { PacienteResuelto } from "./pacientes";
import { CitaResuelta, getCita } from "./citas";
import { fichaService, FichaBackendDto } from "@/lib/services/ficha.service";

export interface FichaResuelta extends Omit<Ficha, "pacienteId" | "citaId" | "creadaOffsetDias"> {
  creadaEn: Date;
  paciente: PacienteResuelto;
  cita: CitaResuelta;
}

function mapBackendDtoToResuelta(dto: FichaBackendDto): FichaResuelta {
  const fechaCita = dto.citaFecha ? new Date(dto.citaFecha) : new Date();
  const fechaCreacionRaw = dto.createdAt || dto.creadaEn;
  const fechaCreacion = fechaCreacionRaw ? new Date(fechaCreacionRaw) : fechaCita;
  const nombreCreador = dto.creadoPorNombre || dto.registradaPor || (dto.creadoPorUsuarioId ? `Usuario #${dto.creadoPorUsuarioId}` : "Personal de Salud");

  return {
    id: String(dto.id),
    formatoId: dto.formatoId || "general",
    tipo: dto.tipoFicha || (dto.tipo === "Recomendacion" ? "Recomendación de Masoterapia" : "Ficha Clínica"),
    registradaPor: nombreCreador,
    creadaEn: fechaCreacion,
    contenido: dto.contenido || {},
    adjuntos: dto.adjuntos ? dto.adjuntos.map((a) => a.nombreOriginal) : [],
    paciente: {
      id: String(dto.pacienteId || 1),
      nombre: dto.pacienteNombre ? dto.pacienteNombre.split(" ")[0] : "Paciente",
      apellido: dto.pacienteNombre ? dto.pacienteNombre.split(" ").slice(1).join(" ") : "",
      rut: dto.pacienteRut || "",
      correo: "",
      telefono: "",
      origenRegistro: "manual",
      creadoHaceDias: 0,
    },
    cita: {
      id: String(dto.citaId),
      servicio: dto.servicioNombre?.toLowerCase().includes("kinesiol") ? "kinesiologia" : "masajes",
      horaInicio: dto.citaHoraInicio || "09:00",
      horaTermino: dto.citaHoraTermino || "10:00",
      estado: "atendida",
      origen: "manual",
      fecha: fechaCita,
      creadaEn: fechaCita,
      paciente: {
        id: String(dto.pacienteId || 1),
        nombre: dto.pacienteNombre ? dto.pacienteNombre.split(" ")[0] : "Paciente",
        apellido: dto.pacienteNombre ? dto.pacienteNombre.split(" ").slice(1).join(" ") : "",
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

export async function listFichas(_hoy?: Date, filtro: FiltroFichas = {}): Promise<FichaResuelta[]> {
  try {
    const res = await fichaService.getAll({
      busqueda: filtro.termino,
      tipoFicha: filtro.tipo,
      fechaDesde: filtro.desde ? filtro.desde.toISOString().split("T")[0] : undefined,
      fechaHasta: filtro.hasta ? filtro.hasta.toISOString().split("T")[0] : undefined,
    });
    if (res?.data && Array.isArray(res.data)) {
      return res.data.map(mapBackendDtoToResuelta);
    }
  } catch {
    // Error backend
  }
  return [];
}

export async function getFicha(id: string, hoy?: Date): Promise<FichaResuelta | undefined> {
  try {
    const numId = parseInt(id.replace(/\D/g, ""), 10);
    const todas = await listFichas(hoy);
    const resumen = todas.find((f) => f.id === String(numId) || f.id === id);

    const apiData = await fichaService.getById(id);
    if (apiData) {
      const resuelta = mapBackendDtoToResuelta(apiData);
      if (resumen) {
        resuelta.paciente = {
          ...resumen.paciente,
          ...resuelta.paciente,
          rut: resumen.paciente.rut || resuelta.paciente.rut,
        };
        resuelta.registradaPor = resumen.registradaPor || resuelta.registradaPor;
        resuelta.tipo = resumen.tipo || resuelta.tipo;
        if (resumen.cita) {
          resuelta.cita = { ...resumen.cita, ...resuelta.cita };
        }
      }
      if (!resuelta.paciente.rut && resuelta.cita.id && hoy) {
        try {
          const citaObj = await getCita(resuelta.cita.id, hoy);
          if (citaObj) {
            resuelta.cita = citaObj;
            resuelta.paciente = citaObj.paciente;
          }
        } catch {
          // Ignorar
        }
      }
      return resuelta;
    }
  } catch {
    const todas = await listFichas(hoy);
    return todas.find((f) => f.id === String(id) || f.id === id);
  }
  return undefined;
}

export async function fichasDelPaciente(pacienteId: string, _hoy?: Date): Promise<FichaResuelta[]> {
  try {
    const apiData = await fichaService.getHistorialPorPaciente(pacienteId);
    if (apiData && Array.isArray(apiData)) {
      return apiData.map(mapBackendDtoToResuelta);
    }
  } catch {
    // Error backend
  }
  return [];
}

export async function fichaDeLaCita(citaId: string, _hoy?: Date): Promise<FichaResuelta | undefined> {
  try {
    const numId = parseInt(citaId.replace(/\D/g, ""), 10);
    if (!isNaN(numId)) {
      const res = await fichaService.getAll();
      const hallada = res?.data?.find((f) => f.citaId === numId);
      if (hallada) return mapBackendDtoToResuelta(hallada);
    }
  } catch {
    // Error backend
  }
  return undefined;
}

export async function totalFichas(): Promise<number> {
  try {
    const res = await fichaService.getAll();
    if (res?.total !== undefined) return res.total;
    if (res?.data && Array.isArray(res.data)) return res.data.length;
  } catch {
    // Error backend
  }
  return 0;
}
