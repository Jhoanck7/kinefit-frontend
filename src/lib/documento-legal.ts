export interface SeccionDocumentoLegal {
  titulo: string;
  texto: string;
}

/** Lee las secciones guardadas de un documento legal; un texto antiguo sin secciones queda como una sola sección sin título */
export function leerSeccionesDocumentoLegal(
  valor: string | undefined
): SeccionDocumentoLegal[] {
  if (!valor?.trim()) return [];
  try {
    const parsed = JSON.parse(valor);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(s => s && typeof s === "object")
      .map(s => ({
        titulo: typeof s.titulo === "string" ? s.titulo : "",
        texto: typeof s.texto === "string" ? s.texto : "",
      }));
  } catch {
    return [{ titulo: "", texto: valor }];
  }
}
