import { apiClient } from '@/lib/api/apiClient';
import { Appointment, CreateAppointmentDto } from '@/types';

export const appointmentService = {
  async getAll(): Promise<Appointment[]> {
    return apiClient.get<Appointment[]>('/appointments');
  },

  async getById(id: string): Promise<Appointment> {
    return apiClient.get<Appointment>(`/appointments/${id}`);
  },

  async create(appointmentData: CreateAppointmentDto): Promise<Appointment> {
    return apiClient.post<Appointment>('/appointments', appointmentData);
  },

  async cancel(id: string): Promise<void> {
    return apiClient.delete<void>(`/appointments/${id}`);
  },

  async getAvailableSlots(date: string): Promise<string[]> {
    return apiClient.get<string[]>(`/appointments/slots?date=${date}`);
  }
};
