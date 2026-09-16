import { parsePhoneNumberFromString } from "libphonenumber-js";

export function limpiarRut(rut: string): string {
  return rut.replace(/\./g, "").replace(/-/g, "").trim().toUpperCase();
}

// Mismo algoritmo mod-11 que RutHelper.cs en el backend: debe dar el mismo resultado.
function calcularDv(cuerpo: string): string {
  let suma = 0;
  let multiplicador = 2;
  let n = Number(cuerpo);

  while (n > 0) {
    suma += (n % 10) * multiplicador;
    n = Math.floor(n / 10);
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = 11 - (suma % 11);
  if (resto === 11) return "0";
  if (resto === 10) return "K";
  return String(resto);
}

export function esRutValido(rut: string): boolean {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2) return false;
  if (!/^[0-9]+[0-9K]$/.test(limpio)) return false;

  const dv = limpio.slice(-1);
  const cuerpo = limpio.slice(0, -1);
  if (!/^[0-9]+$/.test(cuerpo)) return false;

  return dv === calcularDv(cuerpo);
}

export function formatearRut(rut: string): string {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2) return limpio;

  const dv = limpio.slice(-1);
  const cuerpo = limpio.slice(0, -1);
  const cuerpoConPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${cuerpoConPuntos}-${dv}`;
}

export function limpiarTelefono(telefono: string): string {
  return telefono.replace(/[^\d]/g, "");
}

export function esTelefonoValido(telefono: string): boolean {
  const limpio = limpiarTelefono(telefono);
  const numero = parsePhoneNumberFromString(`+${limpio}`, "CL");
  if (!numero || !numero.isValid()) return false;
  return numero.country === "CL" && numero.nationalNumber.startsWith("9");
}
