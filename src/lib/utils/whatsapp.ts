export function generarEnlaceWhatsApp(
  servicioName: string,
  fecha: string
): string {
  const TELEFONO = "56962072672";

  // Definimos el texto usando template strings planos
  const textoMensaje = `¡Hola Kinefit! Me gustaría confirmar una cita para el servicio de: ${servicioName}`;

  // Codificamos el texto para que sea una URL válida
  const mensajeCodificado = encodeURIComponent(textoMensaje);

  return `https://wa.me/${TELEFONO}?text=${mensajeCodificado}`;
}
