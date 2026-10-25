import type { Metadata } from "next";

import { DocumentoLegalView } from "@/views";

export const metadata: Metadata = {
  title: "Política de Privacidad | KineFit Chile",
  description:
    "Cómo KineFit Chile recopila, usa y protege los datos personales de sus pacientes.",
};

export const revalidate = 60;

/** Página de política de privacidad, con el texto configurado desde el panel */
export default function PoliticaDePrivacidadPage() {
  return (
    <DocumentoLegalView titulo="Política de Privacidad" clave="privacidad" />
  );
}
