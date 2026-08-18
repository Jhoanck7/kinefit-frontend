import { useMutation, useQuery } from "@tanstack/react-query";

import {
  appointmentService,
  authService,
  transaccionService,
} from "@/services";

export const useGetServices = (soloActivos = true) => {
  return useQuery({
    queryKey: ["booking-services", { soloActivos }],
    queryFn: () =>
      appointmentService.getServices(soloActivos).then(res => res.data.data),
  });
};

export const useGetSpecialists = (servicioId?: number, soloActivos = true) => {
  return useQuery({
    queryKey: ["booking-specialists", servicioId, { soloActivos }],
    queryFn: () =>
      appointmentService
        .getEspecialistas(servicioId, soloActivos)
        .then(res => res.data.data),
    enabled: Boolean(servicioId),
  });
};

export const useGetAvailableSlots = (
  especialistaId?: number,
  fecha?: string
) => {
  return useQuery({
    queryKey: ["booking-available-slots", especialistaId, fecha],
    queryFn: () =>
      appointmentService
        .getBloques(especialistaId as number, fecha as string)
        .then(res => res.data.data),
    enabled: Boolean(especialistaId) && Boolean(fecha),
  });
};

interface SubmitBookingParams {
  selectedServiceId: number;
  selectedSpecialistId: number;
  selectedBloqueHorarioId: number;
  selectedDuracionMinutos: number;
  patientName: string;
  patientPhone: string;
  patientRut: string;
  authToken: string;
}

export const useSubmitBookingMutation = () => {
  return useMutation({
    mutationFn: async ({
      selectedServiceId,
      selectedSpecialistId,
      selectedBloqueHorarioId,
      selectedDuracionMinutos,
      patientName,
      patientPhone,
      patientRut,
      authToken,
    }: SubmitBookingParams) => {
      const rutFormatted =
        patientRut && patientRut.trim() ? patientRut.trim() : "11111111-1";
      const phoneFormatted =
        patientPhone && patientPhone.trim()
          ? patientPhone.trim()
          : "+56975516503";

      try {
        await authService.updatePerfil(
          { rut: rutFormatted, telefono: phoneFormatted },
          authToken
        );
      } catch (perfilErr: unknown) {
        const perfilMsg =
          perfilErr instanceof Error
            ? perfilErr.message
            : "Error al actualizar el perfil en el backend.";
        throw new Error(
          `Error en perfil: ${perfilMsg}. Comprueba que tu RUT sea válido (ej: 11111111-1 o 12345678-5).`
        );
      }

      const citaRes = await appointmentService.crearCita(
        {
          especialistaId: selectedSpecialistId,
          servicioId: selectedServiceId,
          bloqueHorarioId: selectedBloqueHorarioId,
          duracionMinutos: selectedDuracionMinutos,
          empresaId: null,
          notaPaciente: `Reserva para ${patientName}`,
        },
        authToken
      );
      const createdCitaId = citaRes.data.data.citaId;

      const transRes = await transaccionService.iniciarTransaccion(
        createdCitaId,
        authToken
      );

      return { createdCitaId, webpayData: transRes.data.data };
    },
  });
};
