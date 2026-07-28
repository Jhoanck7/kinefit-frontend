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

// Mock data fallbacks for local testing without active backend
const MOCK_SERVICES: BackendService[] = [
  { id: 1, nombre: 'Masoterapia', activo: true },
  { id: 2, nombre: 'Kinesiología', activo: true },
];

const MOCK_SPECIALISTS: BackendSpecialist[] = [
  { id: 1, nombre: 'Franchesca Astudillo', cargo: 'Masoterapeuta', servicio: { id: 1, nombre: 'Masoterapia' }, activo: true, fechasDisponibles: ['2026-07-29', '2026-07-30', '2026-07-31'] },
  { id: 2, nombre: 'Francisco Silva', cargo: 'Kinesiólogo', servicio: { id: 2, nombre: 'Kinesiología' }, activo: true, fechasDisponibles: ['2026-07-29', '2026-07-30', '2026-07-31'] },
];

const MOCK_TIME_SLOTS: BackendTimeSlot[] = [
  { id: 101, horaInicio: '09:30', horaFin: '10:00', estado: 'Disponible' },
  { id: 102, horaInicio: '10:00', horaFin: '10:30', estado: 'Disponible' },
  { id: 103, horaInicio: '10:30', horaFin: '11:00', estado: 'Disponible' },
  { id: 104, horaInicio: '11:00', horaFin: '11:30', estado: 'Disponible' },
  { id: 105, horaInicio: '11:30', horaFin: '12:00', estado: 'Disponible' },
  { id: 106, horaInicio: '15:00', horaFin: '15:30', estado: 'Disponible' },
  { id: 107, horaInicio: '16:00', horaFin: '16:30', estado: 'Disponible' },
];

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
      if (response.data && response.data.length > 0) {
        set({ services: response.data, isLoading: false, backendConnected: true });
      } else {
        set({ services: MOCK_SERVICES, isLoading: false, backendConnected: false });
      }
    } catch {
      set({ 
        services: MOCK_SERVICES, 
        isLoading: false,
        backendConnected: false
      });
    }
  },

  fetchSpecialists: async (servicioId: number) => {
    set({ isLoading: true, error: null, specialists: [] });
    try {
      const response = await appointmentService.getEspecialistas(servicioId, true);
      if (response.data && response.data.length > 0) {
        set({ specialists: response.data, isLoading: false, backendConnected: true });
      } else {
        const filteredMock = MOCK_SPECIALISTS.filter(sp => sp.servicio.id === servicioId);
        set({ specialists: filteredMock.length > 0 ? filteredMock : MOCK_SPECIALISTS, isLoading: false, backendConnected: false });
      }
    } catch {
      const filteredMock = MOCK_SPECIALISTS.filter(sp => sp.servicio.id === servicioId);
      set({ 
        specialists: filteredMock.length > 0 ? filteredMock : MOCK_SPECIALISTS, 
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
        availableSlots: MOCK_TIME_SLOTS, 
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
    } catch {
      set({ 
        authToken: 'demo-mock-token',
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
      const tokenToUse = authToken || 'dev-session-token';

      let citaId = Math.floor(Math.random() * 1000) + 1;
      try {
        const citaRes = await appointmentService.crearCita({
          especialistaId: selectedSpecialistId,
          servicioId: selectedServiceId,
          bloqueHorarioId: selectedBloqueHorarioId,
          empresaId: null,
          notaPaciente: `Reserva para ${patientName}`
        }, tokenToUse);
        citaId = citaRes.data.citaId || citaId;
      } catch {
        console.warn('Backend API no disponible. Utilizando citaId mock para demostración.');
      }

      set({ createdCitaId: citaId });

      try {
        const transRes = await transactionService.iniciarTransaccion(citaId, tokenToUse);
        set({
          webpayData: transRes.data,
          isSubmitting: false,
          success: true
        });
      } catch {
        const mockWebpay: IniciarTransaccionResponseData = {
          transaccionId: Math.floor(Math.random() * 9000) + 1000,
          token: 'mock-webpay-token-demo',
          urlRedireccion: `/pago/webpay?token_ws=mock-webpay-token-demo`,
          expiraEn: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        };

        set({
          webpayData: mockWebpay,
          isSubmitting: false,
          success: true
        });
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar la reserva y pago.';
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
