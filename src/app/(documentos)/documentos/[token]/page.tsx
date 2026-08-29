"use client";

import { useParams } from "next/navigation";

import FirmaDocumentoView from "@/views/app/(documentos)/documentos";

export default function FirmaDocumentoPage() {
  const { token } = useParams<{ token: string }>();

  return <FirmaDocumentoView token={token} />;
}
