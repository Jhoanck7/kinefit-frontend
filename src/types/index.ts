// API Error Contract
export interface ApiErrorResponse {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}

// Service Controller
export interface BackendService {
  id: number;
  nombre: string;
  activo: boolean;
}

// Specialist Controller
export interface BackendSpecialist {
  id: number;
  nombre: string;
  cargo: string;
  email?: string;
  descripcion?: string;
  fotoUrl?: string;
  servicio?: {
    id: number;
    nombre: string;
  } | null;
  activo: boolean;
  fechasDisponibles?: string[];
}

// TimeSlot / BloqueHorario Controller
export interface BackendTimeSlot {
  id: number;
  horaInicio: string;
  horaFin: string;
  estado: "Disponible" | "Ocupado" | "Bloqueado" | string;
  hora?: string;
  especialistaSanityId?: string;
  fecha?: string;
}

// Auth Controller
export interface AuthPatient {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  perfilCompleto: boolean;
  rut?: string;
  telefono?: string;
}

export interface AuthGoogleResponse {
  data: {
    token: string;
    expiraEn: string;
    paciente: AuthPatient;
  };
  message: string;
}

// Cita Controller
export interface CreateCitaDto {
  especialistaId: number;
  servicioId: number;
  bloqueHorarioId: number;
  duracionMinutos: number;
  empresaId?: number | null;
  notaPaciente?: string | null;
}

export interface CitaResponseData {
  id?: number;
  citaId?: number;
  pacienteId?: number;
  especialistaId?: number;
  servicioId?: number;
  bloqueHorarioId?: number;
  estado?: string;
  createdAt?: string;
}

// Transaccion Controller
export interface IniciarTransaccionResponseData {
  transaccionId?: number;
  token: string;
  urlRedireccion: string;
  expiraEn?: string;
}

export interface ConfirmarTransaccionResponseData {
  resultado: "Aprobado" | "Rechazado";
  cita?: {
    id: number;
    estado: string;
    especialista: string;
    servicio: string;
    fecha: string;
    hora: string;
  };
  transaccion?: {
    id: number;
    buyOrder: string;
    monto: number;
    estado: string;
  };
  id: number;
  citaId: number;
  buyOrder: string;
  monto: number;
  estado: "Aprobado" | "Rechazado" | "Expirado" | "Iniciado" | string;
  estadoCita: "Confirmada" | "Cancelada" | "Expirada" | "PendientePago" | string;
  createdAt: string;
  updatedAt: string;
  advertencia?: string | null;
}

// Legacy CMS Interfaces
export interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string;
  timeSlot: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

export interface CreateAppointmentDtoLegacy {
  serviceId: string;
  date: string;
  timeSlot: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: { asset: { _ref: string; _type: string } };
  publishedAt: string;
  body: unknown[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
}

export interface Usuario {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: Usuario;
}

export interface SanityServiceItem {
  id: number;
  nombre: string;
  description?: string;
  price: string;
  duration: string;
  features?: string[];
}

export interface SanityTeamMemberItem {
  nombre: string;
  cargo: string;
  email: string;
  imageUrl: string;
  specialty?: string;
}

export interface SanityTestimonialItem {
  nombre: string;
  cargo: string;
  content: string;
  rating?: number;
}

export interface SanityGalleryItem {
  title: string;
  description: string;
  imageUrl: string;
  features?: string[];
}
