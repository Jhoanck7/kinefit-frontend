import { CitaDetalleResponse, CitaResumenResponse } from "@/models/responses";
import { citaService, pacienteService } from "@/services";

import { fechaISO } from "../domain/formato";
import {
  Bloqueo,
  Cita,
  CodigoEstadoCita,
  Especialista,
  Servicio,
} from "../domain/tipos";
import { CITAS } from "./_seed/citas";
import { CONVENIOS } from "./_seed/convenios";
import { ESPECIALISTAS } from "./_seed/especialistas";
import { PACIENTES } from "./_seed/pacientes";
import { listBloqueosEspecialista } from "./bloqueos";
import { getPaciente, PacienteResuelto } from "./pacientes";
import { fechaDesdeOffset, fechaHoraDesdeOffset } from "./resolver";

export interface CambioEstadoResuelto {
  estado: Cita["estado"];
  fecha: Date;
  responsable: string;
  motivo?: string;
}

export interface CitaResuelta extends Omit<
  Cita,
  | "offsetDias"
  | "creadaOffsetDias"
  | "creadaHora"
  | "historial"
  | "pacienteId"
  | "especialistaId"
> {
  fecha: Date;
  creadaEn: Date;
  servicioNombre?: string;
  paciente: PacienteResuelto;
  especialista: Especialista;
  historial: CambioEstadoResuelto[];
  montoAnticipo?: number;
  webpayTransaccionId?: string;
  notas?: {
    paciente?: string;
    interna?: string;
  };
}

export interface BloqueoResuelto extends Omit<
  Bloqueo,
  "offsetDias" | "especialistaId"
> {
  fecha: Date;
  especialista: Especialista;
}

const MAPA_ESPECIALISTA_ID: Record<string, number> = {
  "esp-franchesca": 1,
  "esp-valeria": 2,
  "esp-constanza": 3,
};

function mapEstadoBackendToDomain(estadoBackend: string): CodigoEstadoCita {
  const e = estadoBackend?.toLowerCase();
  if (e === "atendida") return "atendida";
  if (e === "cancelada") return "cancelada";
  if (e === "noasistida" || e === "no_asistida") return "no_asistida";
  if (e === "confirmada") return "confirmada";
  if (e === "pendientepago" || e === "pendiente_pago") return "pendiente_pago";
  return "por_confirmar";
}

function servicioDominio(nombre: string): Servicio {
  return nombre.toLowerCase().includes("kinesiol") ? "kinesiologia" : "masajes";
}

// El backend no informa horaFin en el resumen de listado; se estima con la
// misma heurística (+60 min) que usan los servicios de sesión larga.
function estimarHoraFin(horaInicio: string, servicioNombre: string): string {
  const esLargo =
    servicioNombre.toLowerCase().includes("premium") ||
    servicioNombre.toLowerCase().includes("pareja") ||
    servicioNombre.toLowerCase().includes("reductiv") ||
    servicioNombre.toLowerCase().includes("kinesiolog");
  const [h, m] = horaInicio.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return horaInicio;
  const totalMin = h * 60 + m + (esLargo ? 60 : 45);
  const hFin = Math.floor(totalMin / 60);
  const mFin = totalMin % 60;
  return `${hFin.toString().padStart(2, "0")}:${mFin.toString().padStart(2, "0")}`;
}

function resolverPaciente(id: string): PacienteResuelto {
  const paciente = PACIENTES.find(p => p.id === id);
  if (!paciente) {
    return {
      id,
      nombre: "Paciente",
      apellido: "Registrado",
      rut: "12.345.678-9",
      correo: "paciente@kinefit.cl",
      telefono: "+56 9 1234 5678",
      origenRegistro: "manual",
      creadoHaceDias: 0,
    };
  }
  return {
    ...paciente,
    convenio: paciente.convenioId
      ? CONVENIOS.find(c => c.id === paciente.convenioId)
      : undefined,
  };
}

function resolverEspecialista(id: string): Especialista {
  const especialista = ESPECIALISTAS.find(e => e.id === id);
  if (!especialista) {
    return {
      id,
      nombre: "Especialista KineFit",
      cargo: "Profesional",
      servicios: ["kinesiologia", "masajes"],
    };
  }
  return especialista;
}

function resolverCita(cita: Cita, hoy: Date): CitaResuelta {
  const {
    pacienteId,
    especialistaId,
    offsetDias,
    creadaOffsetDias,
    creadaHora,
    historial,
    ...resto
  } = cita;
  return {
    ...resto,
    fecha: fechaHoraDesdeOffset(hoy, offsetDias, cita.horaInicio),
    creadaEn: fechaHoraDesdeOffset(hoy, creadaOffsetDias, creadaHora),
    paciente: resolverPaciente(pacienteId),
    especialista: resolverEspecialista(especialistaId),
    montoAnticipo:
      (cita as any).montoAnticipo ??
      (cita.origen === "web" ? 10000 : undefined),
    webpayTransaccionId: (cita as any).webpayTransaccionId,
    notas: (cita as any).notas,
    historial: historial.map(h => ({
      estado: h.estado,
      fecha: fechaHoraDesdeOffset(hoy, h.haceDias, h.hora),
      responsable: h.responsable,
      motivo: h.motivo,
    })),
  };
}

// GET /citas (listado) trae paciente y especialista como datos livianos
// (sin rut/telefono/convenio ni cargo real por id). Suficiente para tarjetas
// de agenda; el detalle completo se enriquece en mapDetalleToResuelta.
function mapResumenToResuelta(
  dto: CitaResumenResponse,
  especialistaIdConocido?: number
): CitaResuelta {
  const horaIni = dto.horaInicio.substring(0, 5);
  const horaFin = dto.horaFin
    ? dto.horaFin.substring(0, 5)
    : estimarHoraFin(horaIni, dto.servicio);

  return {
    id: String(dto.id),
    servicio: servicioDominio(dto.servicio),
    servicioNombre: dto.servicio,
    horaInicio: horaIni,
    horaTermino: horaFin,
    estado: mapEstadoBackendToDomain(dto.estado),
    origen: "manual",
    fecha: new Date(dto.fecha),
    creadaEn: new Date(dto.createdAt),
    paciente: {
      id: String(dto.paciente.id),
      nombre: dto.paciente.nombre,
      apellido: dto.paciente.apellido,
      rut: "",
      correo: dto.paciente.email,
      telefono: "",
      origenRegistro: "manual",
      creadoHaceDias: 0,
    },
    especialista: {
      id: String(especialistaIdConocido ?? "0"),
      nombre: dto.especialista,
      cargo: "Profesional",
      servicios: [],
    },
    historial: [],
  };
}

// GET /citas/{id} trae la relación completa (bloque, transacción, montos)
// pero solo id/nombre/apellido/email del paciente; el resto se enriquece
// con getPaciente(). El backend nunca devuelve NotaPaciente/NotaInterna en
// ninguna respuesta de citas aunque las persiste (gap de API, no se inventa).
async function mapDetalleToResuelta(
  dto: CitaDetalleResponse
): Promise<CitaResuelta> {
  const horaIni = dto.horaInicio.substring(0, 5);
  const horaFin = dto.horaFin.substring(0, 5);
  const pacienteCompleto = await getPaciente(String(dto.paciente.id));

  return {
    id: String(dto.id),
    servicio: servicioDominio(dto.servicio.nombre),
    servicioNombre: dto.servicio.nombre,
    horaInicio: horaIni,
    horaTermino: horaFin,
    estado: mapEstadoBackendToDomain(dto.estado),
    origen: dto.origen === "Web" ? "web" : "manual",
    fecha: new Date(dto.fecha),
    creadaEn: new Date(dto.createdAt),
    paciente: pacienteCompleto ?? {
      id: String(dto.paciente.id),
      nombre: dto.paciente.nombre,
      apellido: dto.paciente.apellido,
      rut: "",
      correo: dto.paciente.email,
      telefono: "",
      origenRegistro: "manual",
      creadoHaceDias: 0,
    },
    especialista: {
      id: String(dto.especialista.id),
      nombre: dto.especialista.nombre,
      cargo: dto.especialista.cargo,
      servicios: [],
    },
    montoAnticipo: dto.transaccion?.monto,
    webpayTransaccionId: dto.transaccion?.buyOrder,
    historial: [
      {
        estado: mapEstadoBackendToDomain(dto.estado),
        fecha: new Date(dto.createdAt),
        responsable: dto.origen === "Web" ? "Sistema Web" : "Personal",
      },
    ],
  };
}

export async function getAgendaDia(
  especialistaId: string,
  fecha: Date,
  _hoy?: Date
): Promise<{ citas: CitaResuelta[]; bloqueos: BloqueoResuelto[] }> {
  const fechaObjetivo = fechaISO(fecha);
  const refHoy = _hoy ?? new Date();

  try {
    let targetEspId = parseInt(especialistaId.replace(/\D/g, ""), 10);
    if (isNaN(targetEspId)) {
      targetEspId = MAPA_ESPECIALISTA_ID[especialistaId] || 1;
    }

    const res = await citaService.getAll({
      especialistaId: targetEspId,
      fechaDesde: fechaObjetivo,
      fechaHasta: fechaObjetivo,
    });

    const citasApi = res.data.data.items.map(dto =>
      mapResumenToResuelta(dto, targetEspId)
    );

    const todosBloqueos = await listBloqueosEspecialista(
      especialistaId,
      refHoy
    );
    const bloqueos = todosBloqueos.filter(
      b => fechaISO(b.fecha) === fechaObjetivo && b.activo !== false
    );

    if (citasApi.length > 0) {
      return { citas: citasApi, bloqueos };
    }
  } catch {
    // Si la API falla (ej: sin conexión o 401), recurrimos a fallback
  }

  // Fallback transparente a datos semilla si la API no tiene registros o no está disponible
  const citasSeed = CITAS.filter(
    c =>
      (c.especialistaId === especialistaId ||
        MAPA_ESPECIALISTA_ID[c.especialistaId] ===
          parseInt(especialistaId.replace(/\D/g, ""), 10)) &&
      fechaISO(fechaDesdeOffset(refHoy, c.offsetDias)) === fechaObjetivo
  )
    .map(c => resolverCita(c, refHoy))
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  const todosBloqueos = await listBloqueosEspecialista(especialistaId, refHoy);
  const bloqueos = todosBloqueos.filter(
    b => fechaISO(b.fecha) === fechaObjetivo && b.activo !== false
  );

  return { citas: citasSeed, bloqueos };
}

export async function getCita(
  id: string,
  _hoy?: Date
): Promise<CitaResuelta | undefined> {
  const refHoy = _hoy ?? new Date();

  try {
    const numId = parseInt(id.replace(/\D/g, ""), 10);
    if (!isNaN(numId)) {
      const res = await citaService.getById(numId);
      return await mapDetalleToResuelta(res.data.data);
    }
  } catch {
    // Error al obtener de backend, buscar en semilla
  }

  const citaSeed = CITAS.find(c => c.id === id);
  return citaSeed ? resolverCita(citaSeed, refHoy) : undefined;
}

// El backend no expone un filtro por pacienteId en GET /citas (ni un endpoint
// equivalente); usar ese parámetro devolvía citas de otros pacientes
// mezcladas (bug real, reportado). En su lugar se usa GET /pacientes/{id},
// que ya trae contadores e historial correctamente acotados a ese paciente.
export async function historialPaciente(
  pacienteId: string,
  _hoy?: Date
): Promise<CitaResuelta[]> {
  const refHoy = _hoy ?? new Date();

  try {
    const numId = parseInt(pacienteId.replace(/\D/g, ""), 10);
    if (!isNaN(numId)) {
      const [perfilRes, paciente] = await Promise.all([
        pacienteService.getById(numId, 1, 100),
        getPaciente(pacienteId),
      ]);
      const historial = perfilRes.data.data.historial;
      if (historial.length > 0 && paciente) {
        return historial
          .map(h => {
            const horaIni = h.horaInicio.substring(0, 5);
            return {
              id: String(h.id),
              servicio: servicioDominio(h.servicio),
              servicioNombre: h.servicio,
              horaInicio: horaIni,
              horaTermino: estimarHoraFin(horaIni, h.servicio),
              estado: mapEstadoBackendToDomain(h.estado),
              origen:
                h.origen === "Web" ? ("web" as const) : ("manual" as const),
              fecha: new Date(h.fecha),
              creadaEn: new Date(h.fecha),
              paciente,
              especialista: {
                id: "0",
                nombre: h.especialista,
                cargo: "Profesional",
                servicios: [],
              },
              historial: [],
            };
          })
          .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
      }
    }
  } catch {
    // Fallback
  }

  return CITAS.filter(c => c.pacienteId === pacienteId)
    .map(c => resolverCita(c, refHoy))
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
}

export async function contadoresPaciente(
  pacienteId: string,
  _hoy?: Date
): Promise<{ atendidas: number; canceladas: number; noAsistidas: number }> {
  try {
    const numId = parseInt(pacienteId.replace(/\D/g, ""), 10);
    if (!isNaN(numId)) {
      const res = await pacienteService.getById(numId);
      const c = res.data.data.contadores;
      return {
        atendidas: c.citasAtendidas,
        canceladas: c.citasCanceladas,
        noAsistidas: c.citasNoAsistidas,
      };
    }
  } catch {
    // Fallback
  }

  const historial = await historialPaciente(pacienteId, _hoy);
  return {
    atendidas: historial.filter(c => c.estado === "atendida").length,
    canceladas: historial.filter(c => c.estado === "cancelada").length,
    noAsistidas: historial.filter(c => c.estado === "no_asistida").length,
  };
}

export async function reservasDelPaciente(
  pacienteId: string,
  _hoy?: Date
): Promise<CitaResuelta[]> {
  return historialPaciente(pacienteId, _hoy);
}

export async function listCitasDelDia(
  fecha: Date,
  _hoy?: Date
): Promise<CitaResuelta[]> {
  const fechaObjetivo = fechaISO(fecha);
  const refHoy = _hoy ?? new Date();

  try {
    const res = await citaService.getAll({
      fechaDesde: fechaObjetivo,
      fechaHasta: fechaObjetivo,
    });
    if (res.data.data.items.length > 0) {
      return res.data.data.items.map(dto => mapResumenToResuelta(dto));
    }
  } catch {
    // Fallback
  }

  return CITAS.filter(
    c => fechaISO(fechaDesdeOffset(refHoy, c.offsetDias)) === fechaObjetivo
  ).map(c => resolverCita(c, refHoy));
}
