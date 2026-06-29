import { create } from 'zustand';
import { appointmentService } from '@/lib/services/appointment.service';
import { CreateAppointmentDto } from '@/types';

interface BookingState {
  // State
  selectedServiceId: string | null;
  selectedServiceName: string | null;
  selectedDate: string | null; // YYYY-MM-DD
  selectedTimeSlot: string | null;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  currentStep: number;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;

  // Actions
  setSelectedService: (id: string, name: string) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTimeSlot: (slot: string | null) => void;
  setPatientInfo: (info: { name: string; email: string; phone: string }) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetBooking: () => void;
  submitBooking: () => Promise<void>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedServiceId: null,
  selectedServiceName: null,
  selectedDate: null,
  selectedTimeSlot: null,
  patientName: '',
  patientEmail: '',
  patientPhone: '',
  currentStep: 1,
  isSubmitting: false,
  error: null,
  success: false,

  setSelectedService: (id, name) => set({ selectedServiceId: id, selectedServiceName: name }),
  setSelectedDate: (date) => set({ selectedDate: date, selectedTimeSlot: null }), // Reset timeslot when date changes
  setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
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
    selectedDate: null,
    selectedTimeSlot: null,
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    currentStep: 1,
    isSubmitting: false,
    error: null,
    success: false
  }),
  submitBooking: async () => {
    const { selectedServiceId, selectedDate, selectedTimeSlot, patientName, patientEmail, patientPhone } = get();
    
    if (!selectedServiceId || !selectedDate || !selectedTimeSlot || !patientName || !patientEmail || !patientPhone) {
      set({ error: 'Faltan datos requeridos para completar la reserva.' });
      return;
    }

    set({ isSubmitting: true, error: null });

    try {
      const appointmentData: CreateAppointmentDto = {
        serviceId: selectedServiceId,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        patientName,
        patientEmail,
        patientPhone
      };

      await appointmentService.create(appointmentData);
      set({ success: true, isSubmitting: false });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar la reserva. Por favor intente nuevamente.';
      set({
        error: errorMessage,
        isSubmitting: false
      });
    }
  }
}));
