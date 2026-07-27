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
  setSelectedSpecialist: (id: number, name: string) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTimeSlot: (slot: string | null, id: number | null) => void;
  setPatientInfo: (info: { name: string; email: string; phone: string }) => void;
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
    } catch {
      set({ 
        error: 'No se pudieron cargar los servicios operativos.', 
        isLoading: false,
        backendConnected: false
      });
    }
  },

  fetchSpecialists: async (servicioId: number) => {
    set({ isLoading: true, error: null, specialists: [] });
    try {
      const response = await appointmentService.getEspecialistas(servicioId, true);
      set({ specialists: response.data || [], isLoading: false, backendConnected: true });
    } catch {
      set({ 
        error: 'No se pudieron cargar los especialistas para este servicio.', 
        isLoading: false,
        backendConnected: false
      });
    }
  },

  fetchAvailableSlots: async (especialistaId: number, date: string) => {
    set({ isLoading: true, error: null, availableSlots: [] });
    try {
      const response = await appointmentService.getBloques(especialistaId, date);
      set({ availableSlots: response.data || [], isLoading: false, backendConnected: true });
    } catch {
      set({ 
        error: 'No se pudieron cargar los horarios disponibles para esta fecha.', 
        isLoading: false,
        backendConnected: false
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
      availableSlots: []
    });
    get().fetchSpecialists(id);
  },

  setSelectedSpecialist: (id, name) => set({
    selectedSpecialistId: id,
    selectedSpecialistName: name,
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

  setPatientInfo: (info) => set({
    patientName: info.name,
    patientEmail: info.email,
    patientPhone: info.phone
  }),

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
        isLoading: false 
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al autenticar con Google.';
      set({ error: message, isLoading: false });
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
    patientName: '',
    patientEmail: '',
    patientPhone: '',
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
      // 1. Usar el token existente o fallback token si el entorno local no requiere auth estricta
      const tokenToUse = authToken || 'dev-session-token';

      // 2. Crear Cita
      const citaRes = await appointmentService.crearCita({
        especialistaId: selectedSpecialistId,
        servicioId: selectedServiceId,
        bloqueHorarioId: selectedBloqueHorarioId,
        empresaId: 1
      }, tokenToUse);

      const citaId = citaRes.data.id;
      set({ createdCitaId: citaId });

      // 3. Iniciar Transacción Webpay
      const transRes = await transactionService.iniciarTransaccion(citaId, tokenToUse);

      set({
        webpayData: transRes.data,
        isSubmitting: false,
        success: true
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar la reserva y pago. Intente nuevamente.';
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
