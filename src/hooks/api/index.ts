export {
  useCreateBloqueoMutation,
  useGetAgenda,
  useGetBloqueos,
  useRevertirBloqueoMutation,
} from "./use-agenda-service";
export {
  useGetAvailableSlots,
  useGetServices,
  useGetSpecialists,
  useSubmitBookingMutation,
} from "./use-appointment-service";
export { useAuthenticateWithGoogleMutation } from "./use-auth-service";
export {
  useCreateEspecialistaMutation,
  useDeleteEspecialistaMutation,
  useGetEspecialistas,
  useUpdateEspecialistaEstadoMutation,
  useUpdateEspecialistaMutation,
} from "./use-especialista-service";
export {
  useCreateFichaMutation,
  useEliminarAdjuntoMutation,
  useGetFichaById,
  useGetFichas,
  useGetHistorialPorPaciente,
  useSubirAdjuntoMutation,
} from "./use-ficha-service";
export {
  useDeleteImageMutation,
  useReplaceImageMutation,
  useUploadImageMutation,
} from "./use-media-service";
export {
  useCreatePacienteMutation,
  useGetPacientePerfil,
  useGetPacientes,
  useUpdatePacienteEstadoMutation,
  useUpdatePacienteMutation,
} from "./use-paciente-service";
