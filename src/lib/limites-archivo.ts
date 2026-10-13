// Un 413 de nginx no lleva cabeceras CORS, así que axios solo reporta "Error de red"; por eso se valida el tamaño antes de salir a la red
export const MAX_IMAGEN_BYTES = 25 * 1024 * 1024;
export const MAX_ADJUNTO_BYTES = 15_000_000;

function enMegas(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

/** Lanza un error legible si el archivo supera el tamaño máximo permitido */
export function validarTamano(archivo: File, maximo: number): void {
  if (archivo.size > maximo) {
    throw new Error(
      `"${archivo.name}" pesa ${enMegas(archivo.size)} y el máximo es ${enMegas(maximo)}.`
    );
  }
}
