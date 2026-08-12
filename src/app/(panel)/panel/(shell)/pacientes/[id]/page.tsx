"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PerfilPacientePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/panel/pacientes?paciente=${id}`);
    }
  }, [id, router]);

  return <div aria-hidden />;
}
