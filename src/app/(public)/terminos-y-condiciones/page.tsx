import type { Metadata } from "next";

import { DocumentoLegalView } from "@/views";

export const metadata: Metadata = {
  title: "Términos y Condiciones | KineFit Chile",
  description:
    "Condiciones de uso del sitio y de los servicios de KineFit Chile.",
};

export const revalidate = 60;

/** Página de términos y condiciones, con el texto configurado desde el panel */
export default function TerminosYCondicionesPage() {
  return (
    <DocumentoLegalView titulo="Términos y Condiciones" clave="terminos" />
  );
}
