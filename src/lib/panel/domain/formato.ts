const ZONA_HORARIA = "America/Santiago";

/**
 * Suma días de calendario a una fecha, en la zona horaria del panel.
 * Se usa para resolver offsets de la semilla (§5.4 regla 3) contra el
 * "hoy" ya resuelto del lado del cliente.
 */
export function sumarDias(base: Date, dias: number): Date {
  const resultado = new Date(base);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}

export function fechaISO(fecha: Date): string {
  return fecha.toLocaleDateString("en-CA", { timeZone: ZONA_HORARIA });
}

export function diaSemanaId(fecha: Date): number {
  const formateado = fecha.toLocaleDateString("en-US", {
    timeZone: ZONA_HORARIA,
    weekday: "short",
  });
  const mapa: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return mapa[formateado];
}

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

export function formatearFechaCorta(fecha: Date): string {
  const texto = new Intl.DateTimeFormat("es-CL", {
    timeZone: ZONA_HORARIA,
    day: "numeric",
    month: "short",
  }).format(fecha);
  return texto.replace(".", "");
}

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

/** Único separador de rango horario en todo el panel (G-7, P1-5). */
export function formatearRangoHorario(inicio: string, termino: string): string {
  return `${inicio} – ${termino}`;
}

export function formatearTelefono(telefono: string): string {
  return telefono;
}

/**
 * Calcula el dígito verificador de un RUT chileno (módulo 11). Se usa solo
 * para construir la semilla con RUT válidos (§5.4.3) — nunca para validar
 * lo que ingresa el usuario en un formulario.
 */
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

export function formatearRut(numero: number): string {
  const dv = calcularDV(numero);
  const conPuntos = numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${conPuntos}-${dv}`;
}
