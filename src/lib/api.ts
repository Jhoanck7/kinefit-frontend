import { AxiosError } from "axios";

import { ApiErrorResult } from "@/models/generics";

function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "Solicitud inválida. Verifica los datos enviados.";
    case 401:
      return "No tienes autorización para realizar esta acción.";
    case 403:
      return "No tienes permisos para acceder a este recurso.";
    case 404:
      return "El recurso solicitado no fue encontrado.";
    case 409:
      return "El recurso entra en conflicto con datos ya existentes.";
    case 500:
      return "Error interno del servidor. Inténtalo más tarde.";
    case 502:
      return "El servidor no está disponible temporalmente.";
    case 503:
      return "Servicio no disponible. Inténtalo más tarde.";
    default:
      return "Ha ocurrido un error. Inténtalo nuevamente.";
  }
}

export const handleApiError = (error: unknown): ApiErrorResult => {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return {
        message: "Error de red",
        details: "No se pudo conectar con el servidor.",
        canRetry: true,
      };
    }

    const status = error.response.status;
    const body = error.response.data as Record<string, unknown> | null;

    // Validación automática de [ApiController] (p.ej. [Required] en los DTOs)
    if (body?.errors && typeof body.errors === "object") {
      const detalles = Object.values(body.errors as Record<string, string[]>)
        .flat()
        .join(", ");
      return {
        message: getDefaultErrorMessage(status),
        details: detalles,
        canRetry: status >= 500,
      };
    }

    // Excepciones de negocio (ErrorDetail: status, error, message, timestamp)
    if (typeof body?.message === "string") {
      return {
        message: body.message,
        details: typeof body.error === "string" ? body.error : undefined,
        canRetry: status >= 500,
      };
    }

    return {
      message: getDefaultErrorMessage(status),
      details: undefined,
      canRetry: status >= 500,
    };
  }

  return {
    message: "Ha ocurrido un error inesperado. Inténtalo nuevamente.",
    details: undefined,
    canRetry: true,
  };
};
