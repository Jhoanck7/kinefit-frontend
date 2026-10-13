"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/** Redirige a la lista de pacientes con el paciente seleccionado por query param */
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
