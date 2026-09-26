import type { CuerpoFormato } from "@/models/responses/plantilla";

export interface RespuestaConNombre {
  nombre: string;
  valor: string;
}

export type ContenidoDocumento = Record<
  string,
  string | RespuestaConNombre | null | undefined
>;

function esRespuestaConNombre(bruto: unknown): bruto is RespuestaConNombre {
  return (
    typeof bruto === "object" &&
    bruto !== null &&
    "valor" in (bruto as Record<string, unknown>)
  );
}

export function valorDeRespuesta(bruto: unknown): string {
  if (esRespuestaConNombre(bruto)) return bruto.valor ?? "";
  return typeof bruto === "string" ? bruto : "";
}

export function nombreDeRespuesta(bruto: unknown): string | undefined {
  if (esRespuestaConNombre(bruto) && bruto.nombre) return bruto.nombre;
  return undefined;
}

export function etiquetaDeCampo(
  campoId: string,
  bruto: unknown,
  cuerpo?: CuerpoFormato
): string {
  const propio = nombreDeRespuesta(bruto);
  if (propio) return propio;

  const campo = (cuerpo?.secciones ?? [])
    .flatMap(seccion => seccion.campos)
    .find(c => c.id === campoId);
  return campo?.nombre ?? campoId;
}

export function conNombresDePlantilla(
  contenido: Record<string, string>,
  cuerpo?: CuerpoFormato
): Record<string, RespuestaConNombre> {
  const campos = (cuerpo?.secciones ?? []).flatMap(seccion => seccion.campos);
  return Object.fromEntries(
    Object.entries(contenido).map(([campoId, valor]) => [
      campoId,
      { nombre: campos.find(c => c.id === campoId)?.nombre ?? campoId, valor },
    ])
  );
}

export function soloValores(
  contenido: ContenidoDocumento
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(contenido).map(([campoId, bruto]) => [
      campoId,
      valorDeRespuesta(bruto),
    ])
  );
}

export function conValoresActualizados(
  original: ContenidoDocumento,
  valores: Record<string, string>,
  cuerpo?: CuerpoFormato
): Record<string, RespuestaConNombre> {
  const campos = (cuerpo?.secciones ?? []).flatMap(seccion => seccion.campos);
  return Object.fromEntries(
    Object.entries(valores).map(([campoId, valor]) => [
      campoId,
      {
        nombre:
          nombreDeRespuesta(original[campoId]) ??
          campos.find(c => c.id === campoId)?.nombre ??
          campoId,
        valor,
      },
    ])
  );
}

const TIPOS_NO_RELLENABLES = ["TextoInformativo", "Firma"];

export function contadorDeSeccion(
  seccion: { campos: { id: string; tipo: string }[] },
  contenido: Record<string, string>
): string {
  const rellenables = seccion.campos.filter(
    c => !TIPOS_NO_RELLENABLES.includes(c.tipo)
  );
  const completos = rellenables.filter(c => (contenido[c.id] ?? "").trim());
  return `${completos.length}/${rellenables.length} completados`;
}

export function cuerpoConNombresCongelados(
  cuerpo: CuerpoFormato | undefined,
  contenido: ContenidoDocumento
): CuerpoFormato {
  if (!cuerpo?.secciones?.length) {
    return {
      secciones: [
        {
          id: "registrado",
          nombre: "Contenido registrado",
          orden: 0,
          campos: Object.keys(contenido).map((campoId, orden) => ({
            id: campoId,
            nombre: nombreDeRespuesta(contenido[campoId]) ?? campoId,
            tipo: "TextoLargo" as const,
            obligatorio: false,
            completadoPor: "Profesional" as const,
            orden,
          })),
        },
      ],
    };
  }

  return {
    secciones: cuerpo.secciones.map(seccion => ({
      ...seccion,
      campos: seccion.campos.map(campo => ({
        ...campo,
        nombre: nombreDeRespuesta(contenido[campo.id]) ?? campo.nombre,
      })),
    })),
  };
}
