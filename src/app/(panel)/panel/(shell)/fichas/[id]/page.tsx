"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function FichaGuardadaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/panel/fichas?ficha=${id}`);
    }
  }, [id, router]);

  return <div aria-hidden />;
}
