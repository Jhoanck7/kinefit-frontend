import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from "pdf-lib";

import { CuerpoFormato } from "@/models/responses";

interface DatosDocumento {
  nombre: string;
  servicio: string;
  fecha: string;
  cuerpo: CuerpoFormato;
  contenido: Record<string, string>;
}

const ANCHO = 595.28;
const ALTO = 841.89;
const MARGEN = 56;
const ANCHO_UTIL = ANCHO - MARGEN * 2;
const NEGRO = rgb(0.06, 0.09, 0.16);
const GRIS = rgb(0.42, 0.45, 0.5);
const LINEA = rgb(0.85, 0.87, 0.89);

function partirEnLineas(
  texto: string,
  fuente: PDFFont,
  tamano: number,
  anchoMaximo: number
): string[] {
  const lineas: string[] = [];
  for (const parrafo of texto.split("\n")) {
    if (parrafo.trim() === "") {
      lineas.push("");
      continue;
    }
    let actual = "";
    for (const palabra of parrafo.split(/\s+/)) {
      const tentativa = actual ? `${actual} ${palabra}` : palabra;
      if (fuente.widthOfTextAtSize(tentativa, tamano) <= anchoMaximo) {
        actual = tentativa;
      } else {
        if (actual) lineas.push(actual);
        actual = palabra;
      }
    }
    lineas.push(actual);
  }
  return lineas;
}

class Lienzo {
  private pagina: PDFPage;
  private y: number;

  constructor(
    private doc: PDFDocument,
    private regular: PDFFont,
    private negrita: PDFFont
  ) {
    this.pagina = doc.addPage([ANCHO, ALTO]);
    this.y = ALTO - MARGEN;
  }

  private asegurarEspacio(alto: number) {
    if (this.y - alto >= MARGEN) return;
    this.pagina = this.doc.addPage([ANCHO, ALTO]);
    this.y = ALTO - MARGEN;
  }

  escribir(
    texto: string,
    opciones: {
      tamano?: number;
      negrita?: boolean;
      color?: ReturnType<typeof rgb>;
      espacioAntes?: number;
      espacioDespues?: number;
    } = {}
  ) {
    const tamano = opciones.tamano ?? 10;
    const fuente = opciones.negrita ? this.negrita : this.regular;
    const alturaLinea = tamano * 1.45;
    this.y -= opciones.espacioAntes ?? 0;

    for (const linea of partirEnLineas(texto, fuente, tamano, ANCHO_UTIL)) {
      this.asegurarEspacio(alturaLinea);
      this.pagina.drawText(linea, {
        x: MARGEN,
        y: this.y - tamano,
        size: tamano,
        font: fuente,
        color: opciones.color ?? NEGRO,
      });
      this.y -= alturaLinea;
    }
    this.y -= opciones.espacioDespues ?? 0;
  }

  separador(espacioAntes = 6, espacioDespues = 10) {
    this.y -= espacioAntes;
    this.asegurarEspacio(1);
    this.pagina.drawLine({
      start: { x: MARGEN, y: this.y },
      end: { x: ANCHO - MARGEN, y: this.y },
      thickness: 0.75,
      color: LINEA,
    });
    this.y -= espacioDespues;
  }

  espacioParaFirma(etiqueta: string) {
    this.asegurarEspacio(96);
    this.y -= 18;
    this.pagina.drawLine({
      start: { x: MARGEN, y: this.y },
      end: { x: MARGEN + 220, y: this.y },
      thickness: 0.75,
      color: LINEA,
    });
    this.pagina.drawText(etiqueta, {
      x: MARGEN,
      y: this.y - 14,
      size: 8,
      font: this.regular,
      color: GRIS,
    });
    this.y -= 60;
  }
}

function valorLegible(valor: string | undefined): string {
  const limpio = (valor ?? "").trim();
  return limpio === "" ? "—" : limpio;
}

export async function generarPdfDesdeConstructor(
  datos: DatosDocumento
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const negrita = await doc.embedFont(StandardFonts.HelveticaBold);
  const lienzo = new Lienzo(doc, regular, negrita);

  lienzo.escribir(datos.nombre, { tamano: 16, negrita: true });
  lienzo.escribir(`${datos.servicio} · ${datos.fecha}`, {
    tamano: 9,
    color: GRIS,
    espacioAntes: 2,
  });
  lienzo.separador(10, 14);

  const secciones = [...(datos.cuerpo.secciones ?? [])].sort(
    (a, b) => a.orden - b.orden
  );

  for (const seccion of secciones) {
    if (seccion.nombre.trim()) {
      lienzo.escribir(seccion.nombre.toUpperCase(), {
        tamano: 9,
        negrita: true,
        color: GRIS,
        espacioAntes: 8,
        espacioDespues: 4,
      });
    }

    const campos = [...(seccion.campos ?? [])].sort(
      (a, b) => a.orden - b.orden
    );

    for (const campo of campos) {
      if (campo.tipo === "TextoInformativo") {
        lienzo.escribir(campo.nombre, { tamano: 9.5, espacioDespues: 8 });
        continue;
      }
      if (campo.tipo === "Firma") {
        continue;
      }
      lienzo.escribir(campo.nombre, {
        tamano: 8,
        negrita: true,
        color: GRIS,
        espacioAntes: 4,
      });
      lienzo.escribir(valorLegible(datos.contenido[campo.id]), {
        tamano: 10.5,
        espacioDespues: 4,
      });
    }
  }

  lienzo.separador(14, 4);
  lienzo.espacioParaFirma("Firma del paciente");

  return doc.save();
}

export function bytesADataUrlPdf(bytes: Uint8Array): string {
  let binario = "";
  const bloque = 0x8000;
  for (let i = 0; i < bytes.length; i += bloque) {
    binario += String.fromCharCode(...bytes.subarray(i, i + bloque));
  }
  return `data:application/pdf;base64,${btoa(binario)}`;
}
