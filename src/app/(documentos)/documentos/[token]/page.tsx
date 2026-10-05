"use client";

import { useParams } from "next/navigation";

import FirmaDocumentoView from "@/views/app/(documentos)/documentos";

/** Página pública de firma de documento, obtiene el token de la URL y renderiza la vista de firma */
export default function FirmaDocumentoPage() {
  const { token } = useParams<{ token: string }>();

  return <FirmaDocumentoView token={token} />;
}
