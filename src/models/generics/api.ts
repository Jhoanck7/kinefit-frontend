/** Describe un error devuelto por el backend */
export interface ErrorDetail {
  message: string;
  details?: string;
}

/** Resultado de error normalizado para el manejo de peticiones en el frontend */
export interface ApiErrorResult extends ErrorDetail {
  canRetry: boolean;
}

/** Envoltorio genérico de las respuestas exitosas del backend */
export interface ApiResponse<T> {
  message?: string;
  data: T;
}
