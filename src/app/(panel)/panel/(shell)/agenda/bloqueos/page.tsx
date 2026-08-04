"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHoyPanel } from "@/lib/panel/reloj";
import { usePanelSessionStore, USUARIO_SESION_PANEL } from "@/lib/store/usePanelSessionStore";
import { listBloqueosEspecialista } from "@/lib/panel/data/bloqueos";
import { BloqueoResuelto } from "@/lib/panel/data/citas";
import { formatearFechaExtensa, formatearRangoHorario } from "@/lib/panel/domain/formato";
import { Card } from "@/components/panel/primitives/Card";
import { EmptyState } from "@/components/panel/primitives/EmptyState";

export default function BloqueosPage() {
  const router = useRouter();
  const hoy = useHoyPanel();
  const usuario = usePanelSessionStore((s) => s.usuario) ?? USUARIO_SESION_PANEL;
  const [bloqueos, setBloqueos] = useState<BloqueoResuelto[] | null>(null);

  useEffect(() => {
    if (!hoy) return;
    listBloqueosEspecialista(usuario.especialistaId ?? "esp-franchesca", hoy).then(setBloqueos);
  }, [hoy, usuario.especialistaId]);

  if (!hoy || bloqueos === null) return <div aria-hidden />;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/panel/agenda")}
          className="flex items-center gap-1 text-sm text-panel-sidebar underline underline-offset-2"
        >
          ← Volver a Agenda
        </button>
      </div>
      <h2 className="mb-1 text-lg font-bold text-panel-sidebar">Bloqueos de agenda</h2>
      <p className="mb-6 text-sm text-brand-muted">
        Franjas bloqueadas por {usuario.nombre}.
      </p>

      <Card className="p-0 overflow-hidden">
        {bloqueos.length === 0 ? (
          <EmptyState titulo="Sin bloqueos" descripcion="No hay bloqueos de agenda registrados." />
        ) : (
          <ul className="divide-y divide-brand-border">
            {bloqueos.map((bloqueo) => (
              <li key={bloqueo.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-panel-sidebar">{bloqueo.motivo}</p>
                  <p className="text-sm text-brand-muted">
                    {formatearFechaExtensa(bloqueo.fecha)} · {formatearRangoHorario(bloqueo.horaInicio, bloqueo.horaTermino)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
