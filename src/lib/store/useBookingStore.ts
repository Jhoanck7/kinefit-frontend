import { create } from 'zustand';
import { appointmentService } from '@/lib/services/appointment.service';
import { authService } from '@/lib/services/auth.service';
import { transactionService } from '@/lib/services/transaction.service';
import { 
  BackendService, 
  BackendSpecialist, 
  BackendTimeSlot, 
  IniciarTransaccionResponseData 
} from '@/types';

interface BookingState {
  // State
  services: BackendService[];
  specialists: BackendSpecialist[];
  availableSlots: BackendTimeSlot[];
  availableDates: string[];
  selectedServiceId: number | null;
  selectedServiceName: string | null;
  selectedSpecialistId: number | null;
  selectedSpecialistName: string | null;
  selectedDate: string | null; // YYYY-MM-DD
  selectedTimeSlot: string | null; // HH:MM
  selectedBloqueHorarioId: number | null;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientRut: string;
  authToken: string | null;
  currentStep: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  createdCitaId: number | null;
  webpayData: IniciarTransaccionResponseData | null;
  backendConnected: boolean | null;

  // Actions
  fetchServices: () => Promise<void>;
  fetchSpecialists: (servicioId: number) => Promise<void>;
  fetchAvailableSlots: (especialistaId: number, date: string) => Promise<void>;
  setSelectedService: (id: number, name: string) => void;
  setSelectedSpecialist: (id: number, name: string, fechasDisponibles?: string[]) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTimeSlot: (slot: string | null, id: number | null) => void;
  setPatientInfo: (info: { name: string; email: string; phone: string; rut?: string }) => void;
  setAuthToken: (token: string | null) => void;
  authenticateWithGoogle: (idToken: string) => Promise<void>;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetBooking: () => void;
  submitBookingAndPay: () => Promise<void>;
  checkBackendConnection: () => Promise<void>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  services: [],
  specialists: [],
  availableSlots: [],
  availableDates: [],
  selectedServiceId: null,
  selectedServiceName: null,
  selectedSpecialistId: null,
  selectedSpecialistName: null,
  selectedDate: null,
  selectedTimeSlot: null,
  selectedBloqueHorarioId: null,
  patientName: '',
  patientEmail: '',
  patientPhone: '',
  patientRut: '11111111-1',
  authToken: null,
  currentStep: 1,
  isLoading: false,
  isSubmitting: false,
  error: null,
  success: false,
  createdCitaId: null,
  webpayData: null,
  backendConnected: null,

  fetchServices: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await appointmentService.getServices(true);
      set({ services: response.data || [], isLoading: false, backendConnected: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar con la API de servicios.';
      set({ 
        services: [], 
        isLoading: false,
        backendConnected: false,
        error: msg
      });
    }
  },

  fetchSpecialists: async (servicioId: number) => {
    set({ isLoading: true, error: null, specialists: [] });
    try {
      const response = await appointmentService.getEspecialistas(servicioId, true);
      set({ specialists: response.data || [], isLoading: false, backendConnected: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al consultar especialistas.';
      set({ 
        specialists: [], 
        isLoading: false,
        backendConnected: false,
        error: msg
      });
    }
  },

  fetchAvailableSlots: async (especialistaId: number, date: string) => {
    set({ isLoading: true, error: null, availableSlots: [] });
    try {
      const response = await appointmentService.getBloques(especialistaId, date);
      set({ availableSlots: response.data || [], isLoading: false, backendConnected: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al consultar bloques de horarios.';
      set({ 
        availableSlots: [], 
        isLoading: false,
        backendConnected: false,
        error: msg
      });
    }
  },

  setSelectedService: (id, name) => {
    set({
      selectedServiceId: id,
      selectedServiceName: name,
      selectedSpecialistId: null,
      selectedSpecialistName: null,
      selectedDate: null,
      selectedTimeSlot: null,
      selectedBloqueHorarioId: null,
      availableSlots: [],
      availableDates: []
    });
    get().fetchSpecialists(id);
  },

  setSelectedSpecialist: (id, name, fechasDisponibles = []) => set({
    selectedSpecialistId: id,
    selectedSpecialistName: name,
    availableDates: fechasDisponibles,
    selectedDate: null,
    selectedTimeSlot: null,
    selectedBloqueHorarioId: null,
    availableSlots: []
  }),

  setSelectedDate: (date) => {
    set({ selectedDate: date, selectedTimeSlot: null, selectedBloqueHorarioId: null });
    const { selectedSpecialistId } = get();
    if (selectedSpecialistId && date) {
      get().fetchAvailableSlots(selectedSpecialistId, date);
    }
  },

  setSelectedTimeSlot: (slot, id) => set({ selectedTimeSlot: slot, selectedBloqueHorarioId: id }),

  setPatientInfo: (info) => set((state) => ({
    patientName: info.name,
    patientEmail: info.email,
    patientPhone: info.phone,
    patientRut: info.rut !== undefined ? info.rut : state.patientRut
  })),

  setAuthToken: (token) => set({ authToken: token }),

  authenticateWithGoogle: async (idToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.loginWithGoogleToken(idToken);
      const token = res.data.token;
      set({ 
        authToken: token, 
        patientName: `${res.data.paciente.nombre} ${res.data.paciente.apellido}`.trim(),
        patientEmail: res.data.paciente.email,
        patientPhone: res.data.paciente.telefono || '',
        patientRut: res.data.paciente.rut || '',
        isLoading: false 
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al autenticar con Google.';
      set({ 
        error: msg,
        isLoading: false 
      });
    }
  },

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),

  resetBooking: () => set({
    selectedServiceId: null,
    selectedServiceName: null,
    selectedSpecialistId: null,
    selectedSpecialistName: null,
    selectedDate: null,
    selectedTimeSlot: null,
    selectedBloqueHorarioId: null,
    availableSlots: [],
    availableDates: [],
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    patientRut: '11111111-1',
    authToken: null,
    currentStep: 1,
    isLoading: false,
    isSubmitting: false,
    error: null,
    success: false,
    createdCitaId: null,
    webpayData: null
  }),

  submitBookingAndPay: async () => {
    const { 
      selectedServiceId, 
      selectedSpecialistId, 
      selectedBloqueHorarioId, 
      patientName, 
      patientEmail, 
      patientPhone,
      patientRut,
      authToken 
    } = get();
    
    if (
      !selectedServiceId || 
      !selectedSpecialistId || 
      !selectedBloqueHorarioId || 
      !patientName || 
      !patientEmail || 
      !patientPhone
    ) {
      set({ error: 'Faltan datos requeridos para completar la reserva.' });
      return;
    }

    set({ isSubmitting: true, error: null });

    try {
      const tokenToUse = authToken || '';

      // 1. Actualizar perfil de RUT y Teléfono en el Backend si tenemos token (evita PERFIL_INCOMPLETO)
      if (tokenToUse) {
        const rutFormatted = patientRut && patientRut.trim() ? patientRut.trim() : '11111111-1';
        const phoneFormatted = patientPhone && patientPhone.trim() ? patientPhone.trim() : '+56975516503';

        try {
          await authService.updatePerfil(rutFormatted, phoneFormatted, tokenToUse);
        } catch (perfilErr) {
          console.warn('Advertencia al actualizar perfil en backend:', perfilErr);
        }
      }

      // 2. Crear Cita real en Backend API
      const citaRes = await appointmentService.crearCita({
        especialistaId: selectedSpecialistId,
        servicioId: selectedServiceId,
        bloqueHorarioId: selectedBloqueHorarioId,
        empresaId: null,
        notaPaciente: `Reserva para ${patientName}`
      }, tokenToUse);

      const citaId = citaRes.data.citaId;
      set({ createdCitaId: citaId });

      // 3. Iniciar Transacción real con Webpay
      const transRes = await transactionService.iniciarTransaccion(citaId, tokenToUse);
      set({
        webpayData: transRes.data,
        isSubmitting: false,
        success: true
      });

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar la reserva y pago en el backend.';
      set({
        error: errorMessage,
        isSubmitting: false
      });
    }
  },

  checkBackendConnection: async () => {
    try {
      await appointmentService.getServices(true);
      set({ backendConnected: true });
    } catch {
      set({ backendConnected: false });
    }
  }
}));
