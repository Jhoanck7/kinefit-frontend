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

/** Extrae el valor de texto de una respuesta, venga con nombre o como string plano */
export function valorDeRespuesta(bruto: unknown): string {
  if (esRespuestaConNombre(bruto)) return bruto.valor ?? "";
  return typeof bruto === "string" ? bruto : "";
}

/** Extrae el nombre de campo guardado junto a una respuesta, si lo tiene */
export function nombreDeRespuesta(bruto: unknown): string | undefined {
  if (esRespuestaConNombre(bruto) && bruto.nombre) return bruto.nombre;
  return undefined;
}

/** Obtiene el nombre visible de un campo a partir de la respuesta guardada o de la plantilla */
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

/** Combina cada valor del contenido con el nombre de su campo según la plantilla */
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

/** Reduce el contenido del documento a un mapa de solo los valores de texto */
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

/** Genera el contenido actualizado conservando el nombre original de cada campo */
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

/** Cuenta cuántos campos rellenables de una sección ya tienen respuesta */
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

/** Reconstruye el cuerpo de la plantilla fijando los nombres de campo que tenía el contenido guardado */
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
