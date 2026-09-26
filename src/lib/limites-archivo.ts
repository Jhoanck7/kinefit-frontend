/**
 * Un 413 de nginx no lleva cabeceras CORS, así que el navegador lo descarta y
 * axios solo puede reportar "Error de red". El único lugar donde se puede dar
 * un mensaje útil es acá, antes de salir a la red.
 */

export const MAX_IMAGEN_BYTES = 25 * 1024 * 1024;
export const MAX_ADJUNTO_BYTES = 15_000_000;

function enMegas(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

export function validarTamano(archivo: File, maximo: number): void {
  if (archivo.size > maximo) {
    throw new Error(
      `"${archivo.name}" pesa ${enMegas(archivo.size)} y el máximo es ${enMegas(maximo)}.`
    );
  }
}
