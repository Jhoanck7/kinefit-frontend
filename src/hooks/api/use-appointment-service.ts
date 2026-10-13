import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { handleApiError } from "@/lib/api";
import {
  appointmentService,
  authService,
  transaccionService,
} from "@/services";

/** Obtiene los servicios disponibles para reservar en el sitio público */
export const useGetServices = (soloActivos = true) => {
  return useQuery({
    queryKey: ["booking-services", { soloActivos }],
    queryFn: () =>
      appointmentService.getServices(soloActivos).then(res => res.data.data),
  });
};

/** Obtiene los bloques horarios disponibles de un especialista en una fecha, para el sitio público */
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
  patientConvenioId: string;
  authToken: string;
}

/** Envía la reserva del sitio público: actualiza el perfil del paciente, crea la cita y arranca la transacción de pago */
export const useSubmitBookingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    onError: () => {
      // Otro paciente puede haber tomado el bloque entremedio, se invalida para que el selector deje de ofrecerlo
      queryClient.invalidateQueries({ queryKey: ["disponibilidad"] });
    },
    mutationFn: async ({
      selectedServiceId,
      selectedSpecialistId,
      selectedBloqueHorarioId,
      selectedDuracionMinutos,
      patientName,
      patientPhone,
      patientRut,
      patientConvenioId,
      authToken,
    }: SubmitBookingParams) => {
      const empresaId = patientConvenioId
        ? parseInt(patientConvenioId, 10)
        : undefined;

      try {
        await authService.updatePerfil(
          {
            rut: patientRut.trim(),
            telefono: patientPhone.trim(),
            empresaId,
          },
          authToken
        );
      } catch (perfilErr: unknown) {
        throw new Error(handleApiError(perfilErr).message);
      }

      const citaRes = await appointmentService.crearCita(
        {
          especialistaId: selectedSpecialistId,
          servicioId: selectedServiceId,
          bloqueHorarioId: selectedBloqueHorarioId,
          duracionMinutos: selectedDuracionMinutos,
          empresaId: empresaId ?? null,
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
