import { formatearRut } from "../../domain/formato";
import { Paciente } from "../../domain/tipos";

const DOMINIO_CORREO = "ejemplo.cl";

const MARCAS_DIACRITICAS = /[̀-ͯ]/g;

function correoDe(nombre: string, apellido: string): string {
  const normalizar = (t: string) =>
    t.normalize("NFD").replace(MARCAS_DIACRITICAS, "").toLowerCase();
  return `${normalizar(nombre)[0]}.${normalizar(apellido).split(" ")[0]}@${DOMINIO_CORREO}`;
}

function telefonoDe(indice: number): string {
  const numero = (87430000 + indice * 137).toString().slice(0, 8);
  return `+56 9 ${numero.slice(0, 4)} ${numero.slice(4)}`;
}

interface ProtagonistaSeed {
  id: string;
  nombre: string;
  apellido: string;
  rutNumero: number;
  convenioId?: string;
  origenRegistro: "web" | "manual";
}

/**
 * Los diez protagonistas nombrados en la Parte D de la especificación visual,
 * con las colisiones de la Parte D corregidas: un RUT, una persona.
 */
const PROTAGONISTAS: ProtagonistaSeed[] = [
  {
    id: "pac-lucia-mendez",
    nombre: "Lucía",
    apellido: "Méndez",
    rutNumero: 18234567,
    convenioId: "conv-mineraescondida",
    origenRegistro: "web",
  },
  {
    id: "pac-camila-rojas",
    nombre: "Camila",
    apellido: "Rojas Fuentes",
    rutNumero: 17845321,
    origenRegistro: "web",
  },
  {
    id: "pac-matias-soto",
    nombre: "Matías",
    apellido: "Soto",
    rutNumero: 16987234,
    origenRegistro: "manual",
  },
  {
    id: "pac-valentina-morales",
    nombre: "Valentina",
    apellido: "Morales",
    rutNumero: 17890123,
    origenRegistro: "web",
  },
  {
    id: "pac-diego-herrera",
    nombre: "Diego",
    apellido: "Herrera",
    rutNumero: 19123456,
    origenRegistro: "web",
  },
  {
    id: "pac-francisca-tapia",
    nombre: "Francisca",
    apellido: "Tapia",
    rutNumero: 15678912,
    origenRegistro: "manual",
  },
  {
    id: "pac-felipe-guzman",
    nombre: "Felipe",
    apellido: "Guzmán",
    rutNumero: 16345678,
    convenioId: "conv-bancoestado",
    origenRegistro: "web",
  },
  {
    id: "pac-antonia-vargas",
    nombre: "Antonia",
    apellido: "Vargas",
    rutNumero: 20123789,
    origenRegistro: "manual",
  },
  {
    id: "pac-pablo-bravo",
    nombre: "Pablo",
    apellido: "Bravo",
    rutNumero: 22100112,
    origenRegistro: "manual",
  },
  {
    id: "pac-carlos-vicencio",
    nombre: "Carlos",
    apellido: "Vicencio",
    rutNumero: 14567890,
    origenRegistro: "manual",
  },
];

const NOMBRES_RELLENO = [
  "Javiera",
  "Benjamín",
  "Fernanda",
  "Cristóbal",
  "Catalina",
  "Ignacio",
  "Constanza",
  "Sebastián",
  "Josefa",
  "Vicente",
  "Amanda",
  "Tomás",
  "Isidora",
  "Martín",
  "Florencia",
  "Gabriel",
  "Trinidad",
  "Joaquín",
  "Agustina",
  "Máximo",
  "Emilia",
  "Nicolás",
  "Rocío",
  "Bastián",
  "Daniela",
  "Rodrigo",
  "Paulina",
  "Álvaro",
  "Carolina",
  "Esteban",
  "Natalia",
  "Andrés",
  "Ximena",
  "Pedro",
  "Loreto",
  "Gonzalo",
  "Macarena",
  "Fabián",
];

const APELLIDOS_RELLENO = [
  "González",
  "Muñoz",
  "Rojas",
  "Díaz",
  "Pizarro",
  "Sánchez",
  "Reyes",
  "Espinoza",
  "Fuentes",
  "Contreras",
  "Silva",
  "Carrasco",
  "Gutiérrez",
  "Torres",
  "Flores",
  "Araya",
  "Vega",
  "Castillo",
  "Riquelme",
  "Vergara",
  "Cortés",
  "Aguilar",
  "Sepúlveda",
  "Ortiz",
  "Núñez",
  "Bravo",
  "Toro",
  "Miranda",
  "Pino",
  "Vásquez",
  "Alarcón",
  "Ibarra",
  "Cárdenas",
  "Salazar",
  "Cornejo",
  "Zúñiga",
  "Bustos",
  "Órdenes",
];

function generarRelleno(): Paciente[] {
  return NOMBRES_RELLENO.map((nombre, i) => {
    const apellido = APELLIDOS_RELLENO[i];
    const rutNumero = 10500000 + i * 91;
    return {
      id: `pac-relleno-${i}`,
      nombre,
      apellido,
      rut: formatearRut(rutNumero),
      correo: correoDe(nombre, apellido),
      telefono: telefonoDe(100 + i),
      convenioId: i % 11 === 0 ? "conv-mineraescondida" : undefined,
      origenRegistro: i % 3 === 0 ? "manual" : "web",
      creadoHaceDias: 30 + i * 6,
    } satisfies Paciente;
  });
}

const PROTAGONISTAS_RESUELTOS: Paciente[] = PROTAGONISTAS.map((p, i) => ({
  id: p.id,
  nombre: p.nombre,
  apellido: p.apellido,
  rut: formatearRut(p.rutNumero),
  correo: correoDe(p.nombre, p.apellido),
  telefono: telefonoDe(i),
  convenioId: p.convenioId,
  origenRegistro: p.origenRegistro,
  creadoHaceDias: 15 + i * 20,
}));

/** ~48 pacientes registrados: los 10 protagonistas más relleno generado. */
export const PACIENTES: Paciente[] = [
  ...PROTAGONISTAS_RESUELTOS,
  ...generarRelleno(),
];
