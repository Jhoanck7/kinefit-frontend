"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DocumentoGuardadoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/panel/documentos?documento=${id}`);
    }
  }, [id, router]);

  return <div aria-hidden />;
}
