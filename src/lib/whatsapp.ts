/** Arma el enlace de WhatsApp con un mensaje prellenado para confirmar una cita */
export function generarEnlaceWhatsApp(
  servicioName: string,
  fecha: string
): string {
  const TELEFONO = "56962072672";

  const textoMensaje = `¡Hola Kinefit! Me gustaría confirmar una cita para el servicio de: ${servicioName}`;
  const mensajeCodificado = encodeURIComponent(textoMensaje);

  return `https://wa.me/${TELEFONO}?text=${mensajeCodificado}`;
}
