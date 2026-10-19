const ZONA_HORARIA = "America/Santiago";

// Se usa el mediodía UTC porque la medianoche local varía con la zona horaria del navegador y podía correr la fecha un día en Chile
/** Convierte una fecha "YYYY-MM-DD" del backend en un instante que siempre corresponde a ese mismo día en Chile */
export function desdeFechaISO(fecha: string): Date {
  return new Date(`${fecha}T12:00:00Z`);
}

/** Suma (o resta) días a una fecha y devuelve la nueva fecha */
export function sumarDias(base: Date, dias: number): Date {
  const resultado = new Date(base);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}

/** Formatea una fecha como "YYYY-MM-DD" en la zona horaria de Chile */
export function fechaISO(fecha: Date): string {
  return fecha.toLocaleDateString("en-CA", { timeZone: ZONA_HORARIA });
}

/** Formatea una fecha en español extenso, por ejemplo "lunes 1 de enero de 2026" */
export function formatearFechaExtensa(fecha: Date): string {
  const texto = new Intl.DateTimeFormat("es-CL", {
    timeZone: ZONA_HORARIA,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fecha);
  return capitalizar(texto);
}

/** Formatea una fecha en forma corta, por ejemplo "1 ene" */
export function formatearFechaCorta(fecha: Date): string {
  const texto = new Intl.DateTimeFormat("es-CL", {
    timeZone: ZONA_HORARIA,
    day: "numeric",
    month: "short",
  }).format(fecha);
  return texto.replace(".", "");
}

/** Formatea una fecha con su hora, por ejemplo "1 ene 2026, 14:30" */
export function formatearFechaHora(fecha: Date): string {
  const dia = new Intl.DateTimeFormat("es-CL", {
    timeZone: ZONA_HORARIA,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(fecha);
  const hora = new Intl.DateTimeFormat("es-CL", {
    timeZone: ZONA_HORARIA,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(fecha);
  return `${dia.replace(".", "")}, ${hora}`;
}

/** Formatea una fecha como mes y año, por ejemplo "Enero 2026" */
export function formatearMesAnio(fecha: Date): string {
  const texto = new Intl.DateTimeFormat("es-CL", {
    timeZone: ZONA_HORARIA,
    month: "long",
    year: "numeric",
  }).format(fecha);
  return capitalizar(texto);
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Formatea un rango horario uniendo la hora de inicio y término con un guion largo */
export function formatearRangoHorario(inicio: string, termino: string): string {
  return `${inicio} – ${termino}`;
}

/** Formatea un número de teléfono para mostrarlo (por ahora lo devuelve sin cambios) */
export function formatearTelefono(telefono: string): string {
  return telefono;
}

// Se usa solo para construir RUT válidos de prueba, nunca para validar lo que ingresa el usuario en un formulario
/** Calcula el dígito verificador de un RUT chileno con el algoritmo de módulo 11 */
export function calcularDV(numero: number): string {
  let suma = 0;
  let multiplicador = 2;
  const digitos = numero.toString().split("").reverse();
  for (const digito of digitos) {
    suma += Number(digito) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return "0";
  if (resto === 10) return "K";
  return resto.toString();
}

/** Formatea un número de RUT con puntos de miles y dígito verificador */
export function formatearRut(numero: number): string {
  const dv = calcularDV(numero);
  const conPuntos = numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${conPuntos}-${dv}`;
}
