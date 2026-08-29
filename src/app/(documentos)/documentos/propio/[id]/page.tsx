"use client";

import { useParams } from "next/navigation";

import FirmaDocumentoView from "@/views/app/(documentos)/documentos";

export default function FirmaDocumentoPropioPage() {
  const { id } = useParams<{ id: string }>();

  return <FirmaDocumentoView documentoId={Number(id)} />;
}
