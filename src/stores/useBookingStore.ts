import { create } from "zustand";

interface BookingState {
  // Selección del usuario
  selectedServiceId: number | null;
  selectedServiceName: string | null;
  selectedSpecialistId: number | null;
  selectedSpecialistName: string | null;
  selectedDate: string | null; // YYYY-MM-DD
  selectedTimeSlot: string | null; // HH:MM
  selectedBloqueHorarioId: number | null;
  selectedDuracionMinutos: number | null;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientRut: string;
  authToken: string | null;
  currentStep: number;

  // Actions
  setSelectedService: (id: number, name: string) => void;
  setSelectedSpecialist: (id: number, name: string) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTimeSlot: (slot: string | null, id: number | null) => void;
  setSelectedDuracionMinutos: (minutos: number | null) => void;
  setPatientInfo: (info: {
    name: string;
    email: string;
    phone: string;
    rut?: string;
  }) => void;
  setAuthToken: (token: string | null) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetBooking: () => void;
}

const ESTADO_INICIAL = {
  selectedServiceId: null,
  selectedServiceName: null,
  selectedSpecialistId: null,
  selectedSpecialistName: null,
  selectedDate: null,
  selectedTimeSlot: null,
  selectedBloqueHorarioId: null,
  selectedDuracionMinutos: null,
  patientName: "",
  patientEmail: "",
  patientPhone: "",
  patientRut: "",
  authToken: null,
  currentStep: 1,
};

export const useBookingStore = create<BookingState>(set => ({
  ...ESTADO_INICIAL,

  setSelectedService: (id, name) =>
    set({
      selectedServiceId: id,
      selectedServiceName: name,
      selectedSpecialistId: null,
      selectedSpecialistName: null,
      selectedDate: null,
      selectedTimeSlot: null,
      selectedBloqueHorarioId: null,
    }),

  setSelectedSpecialist: (id, name) =>
    set({
      selectedSpecialistId: id,
      selectedSpecialistName: name,
      selectedDate: null,
      selectedTimeSlot: null,
      selectedBloqueHorarioId: null,
    }),

  setSelectedDate: date =>
    set({
      selectedDate: date,
      selectedTimeSlot: null,
      selectedBloqueHorarioId: null,
    }),

  setSelectedTimeSlot: (slot, id) =>
    set({ selectedTimeSlot: slot, selectedBloqueHorarioId: id }),

  setSelectedDuracionMinutos: minutos =>
    set({ selectedDuracionMinutos: minutos }),

  setPatientInfo: info =>
    set(state => ({
      patientName: info.name,
      patientEmail: info.email,
      patientPhone: info.phone,
      patientRut: info.rut !== undefined ? info.rut : state.patientRut,
    })),

  setAuthToken: token => set({ authToken: token }),

  setStep: step => set({ currentStep: step }),
  nextStep: () => set(state => ({ currentStep: state.currentStep + 1 })),
  prevStep: () =>
    set(state => ({ currentStep: Math.max(1, state.currentStep - 1) })),

  resetBooking: () => set(ESTADO_INICIAL),
}));
