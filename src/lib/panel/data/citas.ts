import { Cita, Especialista, Bloqueo, CodigoEstadoCita, Servicio } from "../domain/tipos";
import { fechaISO } from "../domain/formato";
import { PacienteResuelto, getPaciente } from "./pacientes";
import { listBloqueosEspecialista } from "./bloqueos";
import { citaService, CitaBackendDto } from "@/lib/services/cita.service";

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

export interface BloqueoResuelto extends Omit<Bloqueo, "offsetDias" | "especialistaId"> {
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

// Mapper flexible y robusto para CitaResumenDTO (getAll) y CitaDetalleDTO (getById)
function mapBackendCitaToResuelta(dto: CitaBackendDto): CitaResuelta {
  const fechaCita = dto.fecha ? new Date(dto.fecha) : new Date();

  // 1. Especialista
  let espId = "1";
  let espNombre = "Especialista";
  let espCargo = "Profesional";

  if (dto.especialista && typeof dto.especialista === "object") {
    const objEsp = dto.especialista as { id?: number; nombre?: string; cargo?: string };
    espId = String(objEsp.id || 1);
    espNombre = objEsp.nombre || "Especialista";
    espCargo = objEsp.cargo || "Profesional";
  } else {
    const nombreStr = typeof dto.especialista === "string" ? dto.especialista : dto.especialistaNombre || "";
    espNombre = nombreStr || "Especialista";
    if (dto.especialistaId) {
      espId = String(dto.especialistaId);
    } else if (nombreStr.toLowerCase().includes("franchesca")) {
      espId = "1";
    } else if (nombreStr.toLowerCase().includes("valeria")) {
      espId = "2";
    } else if (nombreStr.toLowerCase().includes("constanza")) {
      espId = "3";
    }
  }

  // 2. Servicio
  let servNombre = "";
  if (dto.servicio && typeof dto.servicio === "object") {
    servNombre = (dto.servicio as { nombre?: string }).nombre || "";
  } else if (typeof dto.servicio === "string") {
    servNombre = dto.servicio;
  } else if (dto.servicioNombre) {
    servNombre = dto.servicioNombre;
  }
  const servDomain: Servicio = servNombre.toLowerCase().includes("kinesiol") ? "kinesiologia" : "masajes";

  // 3. Paciente
  let pId = "1";
  let pNombre = "Paciente";
  let pApellido = "";
  let pRut = "";
  let pEmail = "";
  let pTelefono = "";
  let pConvenioNombre: string | undefined = undefined;
  let pConvenioId: string | undefined = undefined;

  if (dto.paciente && typeof dto.paciente === "object") {
    pId = dto.paciente.id ? String(dto.paciente.id) : String(dto.pacienteId || 1);
    pNombre = dto.paciente.nombre || "Paciente";
    pApellido = dto.paciente.apellido || "";
    pRut = dto.paciente.rut || dto.pacienteRut || "";
    pEmail = dto.paciente.email || "";
    pTelefono = dto.paciente.telefono || "";
    const pObj = dto.paciente as Record<string, unknown>;
    if (pObj.convenioNombre) pConvenioNombre = String(pObj.convenioNombre);
    else if (pObj.empresaNombre) pConvenioNombre = String(pObj.empresaNombre);
    if (pObj.convenioId) pConvenioId = String(pObj.convenioId);
  } else {
    pId = String(dto.pacienteId || 1);
    const full = dto.pacienteNombre || "Paciente";
    const partes = full.split(" ");
    pNombre = partes[0] || "Paciente";
    pApellido = partes.slice(1).join(" ") || "";
    pRut = dto.pacienteRut || "";
  }

  // 4. Tiempos
  const horaIni = dto.horaInicio ? String(dto.horaInicio).substring(0, 5) : "09:00";
  let horaFin = (dto.horaTermino || dto.horaFin) ? String(dto.horaTermino || dto.horaFin).substring(0, 5) : "10:00";

  // Si el servicio es de 60 minutos (ej: Masajes Premium, Pareja, Kinesiología) y la API entrega 30 min, se calcula la hora real de término (60 min)
  const esServicioLargo = servNombre.toLowerCase().includes("premium") || 
                          servNombre.toLowerCase().includes("pareja") || 
                          servNombre.toLowerCase().includes("reductiv") ||
                          servNombre.toLowerCase().includes("kinesiolog");

  if (esServicioLargo && horaIni) {
    const [h, m] = horaIni.split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      const totalMin = h * 60 + m + 60;
      const hFin = Math.floor(totalMin / 60);
      const mFin = totalMin % 60;
      horaFin = `${hFin.toString().padStart(2, "0")}:${mFin.toString().padStart(2, "0")}`;
    }
  }

  // 5. Notas
  let notaPac: string | undefined = undefined;
  let notaInt: string | undefined = undefined;
  if (typeof dto.notas === "string" && dto.notas.trim()) {
    const partes = dto.notas.split("|");
    notaPac = partes[0]?.trim();
    notaInt = partes[1]?.trim();
  }

  // 6. Transacción
  let montoAnticipo: number | undefined = undefined;
  let webpayTransaccionId: string | undefined = undefined;
  if (dto.transaccion && typeof dto.transaccion === "object") {
    montoAnticipo = (dto.transaccion as { monto?: number }).monto;
    webpayTransaccionId = (dto.transaccion as { buyOrder?: string }).buyOrder;
  }

  const fechaCreada = dto.creadaEn || dto.createdAt;

  return {
    id: String(dto.id),
    servicio: servDomain,
    servicioNombre: servNombre || (servDomain === "kinesiologia" ? "Kinesiología" : "Masajes (masoterapia)"),
    horaInicio: horaIni,
    horaTermino: horaFin,
    estado: mapEstadoBackendToDomain(dto.estado),
    origen: dto.origen === "Web" ? "web" : "manual",
    fecha: fechaCita,
    creadaEn: fechaCreada ? new Date(fechaCreada) : fechaCita,
    paciente: {
      id: pId,
      nombre: pNombre,
      apellido: pApellido,
      rut: pRut,
      correo: pEmail,
      telefono: pTelefono,
      origenRegistro: "manual",
      creadoHaceDias: 0,
      convenio: pConvenioNombre ? { id: pConvenioId || "1", nombre: pConvenioNombre } : undefined,
    },
    especialista: {
      id: espId,
      nombre: espNombre,
      cargo: espCargo,
      servicios: ["kinesiologia"],
    },
    montoAnticipo,
    webpayTransaccionId,
    notas: (notaPac || notaInt) ? { paciente: notaPac, interna: notaInt } : undefined,
    historial: [
      {
        estado: mapEstadoBackendToDomain(dto.estado),
        fecha: fechaCreada ? new Date(fechaCreada) : fechaCita,
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

    const citasApi = (res?.data || [])
      .map(mapBackendCitaToResuelta)
      .filter((c) => c.especialista.id === String(targetEspId));

    const todosBloqueos = await listBloqueosEspecialista(especialistaId, _hoy);
    const bloqueos = todosBloqueos.filter(
      (b) => fechaISO(b.fecha) === fechaObjetivo && b.activo !== false
    );
    return { citas: citasApi, bloqueos };
  } catch {
    return { citas: [], bloqueos: [] };
  }
}

export async function getCita(id: string, _hoy?: Date): Promise<CitaResuelta | undefined> {
  try {
    const numId = parseInt(id.replace(/\D/g, ""), 10);
    if (!isNaN(numId)) {
      const apiData = await citaService.getById(numId);
      if (apiData) {
        const citaRes = mapBackendCitaToResuelta(apiData);
        if (!citaRes.paciente.convenio && citaRes.paciente.id) {
          try {
            const pac = await getPaciente(citaRes.paciente.id);
            if (pac?.convenio) {
              citaRes.paciente.convenio = pac.convenio;
            }
          } catch {
            // Ignorar
          }
        }
        return citaRes;
      }
    }
  } catch (err) {
    console.error("Error al obtener detalle de la cita:", err);
  }
  return undefined;
}

export async function historialPaciente(pacienteId: string, _hoy?: Date): Promise<CitaResuelta[]> {
  try {
    const numId = parseInt(pacienteId.replace(/\D/g, ""), 10);
    if (!isNaN(numId)) {
      const res = await citaService.getAll({ pacienteId: numId } as Record<string, unknown>);
      return (res?.data || []).map(mapBackendCitaToResuelta).sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    }
  } catch {
    // Error backend
  }
  return [];
}

export async function contadoresPaciente(
  pacienteId: string,
  _hoy?: Date
): Promise<{ atendidas: number; canceladas: number; noAsistidas: number }> {
  const historial = await historialPaciente(pacienteId, _hoy);
  return {
    atendidas: historial.filter((c) => c.estado === "atendida").length,
    canceladas: historial.filter((c) => c.estado === "cancelada").length,
    noAsistidas: historial.filter((c) => c.estado === "no_asistida").length,
  };
}

export async function reservasDelPaciente(pacienteId: string, _hoy?: Date): Promise<CitaResuelta[]> {
  return historialPaciente(pacienteId, _hoy);
}

export async function listCitasDelDia(fecha: Date, _hoy?: Date): Promise<CitaResuelta[]> {
  const fechaObjetivo = fechaISO(fecha);
  try {
    const res = await citaService.getAll({
      fechaDesde: fechaObjetivo,
      fechaHasta: fechaObjetivo,
    });
    return (res?.data || []).map(mapBackendCitaToResuelta);
  } catch {
    return [];
  }
}
