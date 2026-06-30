import { create } from 'zustand';
import { apiClient } from '@/lib/api/apiClient';

interface Service {
  id: number;
  nombre: string;
  activo: boolean;
}

interface Specialist {
  sanityId: string;
  nombre: string;
  cargo: string;
  activo: boolean;
}

interface TimeSlot {
  id: number;
  especialistaSanityId: string;
  fecha: string;
  hora: string;
  estado: string;
}

interface BookingState {
  // State
  services: Service[];
  specialists: Specialist[];
  availableSlots: TimeSlot[];
  selectedServiceId: number | null;
  selectedServiceName: string | null;
  selectedSpecialistSanityId: string | null;
  selectedSpecialistName: string | null;
  selectedDate: string | null; // YYYY-MM-DD
  selectedTimeSlot: string | null; // HH:MM
  selectedBloqueHorarioId: number | null;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  currentStep: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  backendConnected: boolean | null; // null = checking, true = connected, false = disconnected

  // Actions
  fetchServices: () => Promise<void>;
  fetchSpecialists: (servicioId: number) => Promise<void>;
  fetchAvailableSlots: (sanityId: string, date: string) => Promise<void>;
  setSelectedService: (id: number, name: string) => void;
  setSelectedSpecialist: (sanityId: string, name: string) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTimeSlot: (slot: string | null, id: number | null) => void;
  setPatientInfo: (info: { name: string; email: string; phone: string }) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetBooking: () => void;
  submitBooking: () => Promise<void>;
  checkBackendConnection: () => Promise<void>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  services: [],
  specialists: [],
  availableSlots: [],
  selectedServiceId: null,
  selectedServiceName: null,
  selectedSpecialistSanityId: null,
  selectedSpecialistName: null,
  selectedDate: null,
  selectedTimeSlot: null,
  selectedBloqueHorarioId: null,
  patientName: '',
  patientEmail: '',
  patientPhone: '',
  currentStep: 1,
  isLoading: false,
  isSubmitting: false,
  error: null,
  success: false,
  backendConnected: null,

  fetchServices: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<{ data: Service[] }>('/servicios');
      set({ services: response.data || [], isLoading: false, backendConnected: true });
    } catch {
      set({ 
        error: 'No se pudieron cargar los servicios. Por favor recarga la página.', 
        isLoading: false,
        backendConnected: false
      });
    }
  },

  fetchSpecialists: async (servicioId: number) => {
    set({ isLoading: true, error: null, specialists: [] });
    try {
      const response = await apiClient.get<{ data: Specialist[] }>(`/especialistas?servicioId=${servicioId}`);
      set({ specialists: response.data || [], isLoading: false, backendConnected: true });
    } catch {
      set({ 
        error: 'No se pudieron cargar los especialistas para este servicio.', 
        isLoading: false,
        backendConnected: false
      });
    }
  },

  fetchAvailableSlots: async (sanityId: string, date: string) => {
    set({ isLoading: true, error: null, availableSlots: [] });
    try {
      const response = await apiClient.get<{ data: TimeSlot[] }>(`/bloques?sanityId=${sanityId}&fecha=${date}`);
      set({ availableSlots: response.data || [], isLoading: false, backendConnected: true });
    } catch {
      set({ 
        error: 'No se pudieron cargar los horarios disponibles para esta fecha.', 
        isLoading: false,
        backendConnected: false
      });
    }
  },

  setSelectedService: (id, name) => set({
    selectedServiceId: id,
    selectedServiceName: name,
    selectedSpecialistSanityId: null,
    selectedSpecialistName: null,
    selectedDate: null,
    selectedTimeSlot: null,
    selectedBloqueHorarioId: null,
    availableSlots: []
  }),

  setSelectedSpecialist: (sanityId, name) => set({
    selectedSpecialistSanityId: sanityId,
    selectedSpecialistName: name,
    selectedDate: null,
    selectedTimeSlot: null,
    selectedBloqueHorarioId: null,
    availableSlots: []
  }),

  setSelectedDate: (date) => {
    set({ selectedDate: date, selectedTimeSlot: null, selectedBloqueHorarioId: null });
    const { selectedSpecialistSanityId } = get();
    if (selectedSpecialistSanityId && date) {
      get().fetchAvailableSlots(selectedSpecialistSanityId, date);
    }
  },

  setSelectedTimeSlot: (slot, id) => set({ selectedTimeSlot: slot, selectedBloqueHorarioId: id }),

  setPatientInfo: (info) => set({
    patientName: info.name,
    patientEmail: info.email,
    patientPhone: info.phone
  }),

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),

  resetBooking: () => set({
    selectedServiceId: null,
    selectedServiceName: null,
    selectedSpecialistSanityId: null,
    selectedSpecialistName: null,
    selectedDate: null,
    selectedTimeSlot: null,
    selectedBloqueHorarioId: null,
    availableSlots: [],
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    currentStep: 1,
    isLoading: false,
    isSubmitting: false,
    error: null,
    success: false
  }),

  submitBooking: async () => {
    const { 
      selectedServiceId, 
      selectedSpecialistSanityId, 
      selectedBloqueHorarioId, 
      patientName, 
      patientEmail, 
      patientPhone 
    } = get();
    
    if (
      !selectedServiceId || 
      !selectedSpecialistSanityId || 
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
      const bookingPayload = {
        nombre: patientName,
        email: patientEmail,
        telefono: patientPhone,
        servicioId: selectedServiceId,
        especialistaSanityId: selectedSpecialistSanityId,
        bloqueHorarioId: selectedBloqueHorarioId
      };

      await apiClient.post<{ message?: string }>('/citas', bookingPayload);
      set({ success: true, isSubmitting: false, backendConnected: true });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar la reserva. Por favor intente nuevamente.';
      set({
        error: errorMessage,
        isSubmitting: false,
        backendConnected: false
      });
    }
  },

  checkBackendConnection: async () => {
    try {
      await apiClient.get('/servicios');
      set({ backendConnected: true });
    } catch {
      set({ backendConnected: false });
    }
  }
}));
