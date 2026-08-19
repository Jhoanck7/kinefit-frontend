import { create } from "zustand";

interface BookingState {
  // Selección del usuario
  selectedServiceId: number | null;
  selectedServiceName: string | null;
  selectedDate: string | null; // YYYY-MM-DD
  selectedHoras: string[]; // HH:MM, 1 a 3 bloques consecutivos de 30 min
  selectedSpecialistId: number | null;
  selectedSpecialistName: string | null;
  selectedBloqueHorarioId: number | null;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientRut: string;
  authToken: string | null;
  currentStep: number;

  // Actions
  setSelectedService: (id: number, name: string) => void;
  setSelectedHorario: (date: string | null, horas: string[]) => void;
  setSelectedSpecialist: (
    id: number,
    name: string,
    bloqueHorarioId: number | null
  ) => void;
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
  selectedDate: null,
  selectedHoras: [],
  selectedSpecialistId: null,
  selectedSpecialistName: null,
  selectedBloqueHorarioId: null,
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
      selectedDate: null,
      selectedHoras: [],
      selectedSpecialistId: null,
      selectedSpecialistName: null,
      selectedBloqueHorarioId: null,
    }),

  setSelectedHorario: (date, horas) =>
    set({
      selectedDate: date,
      selectedHoras: horas,
      selectedSpecialistId: null,
      selectedSpecialistName: null,
      selectedBloqueHorarioId: null,
    }),

  setSelectedSpecialist: (id, name, bloqueHorarioId) =>
    set({
      selectedSpecialistId: id,
      selectedSpecialistName: name,
      selectedBloqueHorarioId: bloqueHorarioId,
    }),

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
