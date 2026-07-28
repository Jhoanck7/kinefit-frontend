"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useHoyPanel } from "@/lib/panel/reloj";
import { getFicha, fichasDelPaciente, FichaResuelta } from "@/lib/panel/data/fichas";
import { getFormato, FormatoResuelto } from "@/lib/panel/data/formatos";
import { formatearFechaExtensa, formatearFechaHora, formatearRangoHorario, formatearFechaCorta } from "@/lib/panel/domain/formato";
import { Card } from "@/components/panel/primitives/Card";
import { Button } from "@/components/panel/primitives/Button";
import { NeutralBadge } from "@/components/panel/primitives/Badge";
import { EmptyState } from "@/components/panel/primitives/EmptyState";
import { OutOfScopeInlineLink } from "@/components/panel/primitives/OutOfScope";

export default function FichaGuardadaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const hoy = useHoyPanel();

  const [ficha, setFicha] = useState<FichaResuelta | null | undefined>(undefined);
  const [formato, setFormato] = useState<FormatoResuelto | null>(null);
  const [anteriores, setAnteriores] = useState<FichaResuelta[]>([]);

  useEffect(() => {
    if (!hoy) return;
    getFicha(id, hoy).then((resultado) => setFicha(resultado ?? null));
  }, [id, hoy]);

  useEffect(() => {
    if (!hoy || !ficha) return;
    getFormato(ficha.formatoId, hoy).then((resultado) => setFormato(resultado ?? null));
    fichasDelPaciente(ficha.paciente.id, hoy).then((todas) =>
      setAnteriores(todas.filter((f) => f.id !== ficha.id))
    );
  }, [ficha, hoy]);

  if (!hoy || ficha === undefined) return <div aria-hidden />;

  if (ficha === null) {
    return (
      <EmptyState
        titulo="Ficha no encontrada"
        descripcion="No existe ninguna ficha con ese identificador."
        accion={
          <Button variante="secundario" onClick={() => router.push("/panel/fichas")}>
            Volver a Fichas clínicas
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-2 rounded-lg bg-panel-seleccion p-3 text-xs text-panel-sidebar">
        🔒 Contenido privado. No visible para el paciente.
      </div>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-panel-sidebar">
              {ficha.paciente.nombre} {ficha.paciente.apellido}
            </h2>
            <p className="text-sm text-brand-muted">
              {formatearFechaExtensa(ficha.cita.fecha)} · {formatearRangoHorario(ficha.cita.horaInicio, ficha.cita.horaTermino)}
            </p>
            <p className="mt-1 text-xs text-brand-muted">
              Registrada por {ficha.registradaPor} el {formatearFechaHora(ficha.creadaEn)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NeutralBadge>{ficha.tipo}</NeutralBadge>
            <OutOfScopeInlineLink etiqueta="Editar" />
            <OutOfScopeInlineLink etiqueta="Exportar a PDF" />
          </div>
        </div>
      </Card>

      {formato?.secciones.map((seccion) => (
        <Card key={seccion.id}>
          <p className="mb-4 border-b border-brand-border pb-2 font-bold text-panel-sidebar">{seccion.nombre}</p>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {seccion.campos.map((campo) => (
              <div key={campo.id}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-brand-muted">{campo.nombre}</dt>
                <dd className="text-sm text-panel-sidebar">{ficha.contenido[campo.id] || "—"}</dd>
              </div>
            ))}
          </dl>
        </Card>
      ))}

      {ficha.adjuntos.length > 0 && (
        <Card>
          <p className="mb-3 font-bold text-panel-sidebar">Archivos adjuntos</p>
          <ul className="space-y-2">
            {ficha.adjuntos.map((nombre) => (
              <li key={nombre} className="flex items-center justify-between text-sm">
                <span className="text-panel-sidebar">{nombre}</span>
                <OutOfScopeInlineLink etiqueta="Descargar" />
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <p className="mb-3 font-bold text-panel-sidebar">Fichas anteriores de este paciente</p>
        {anteriores.length === 0 ? (
          <p className="text-sm text-brand-muted">Esta es la única ficha registrada para este paciente.</p>
        ) : (
          <ul className="divide-y divide-brand-border">
            {anteriores.map((anterior) => (
              <li key={anterior.id}>
                <button
                  type="button"
                  onClick={() => router.push(`/panel/fichas/${anterior.id}`)}
                  className="flex w-full items-center justify-between py-3 text-left text-sm hover:bg-panel-fondo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar rounded"
                >
                  <span className="font-medium text-panel-sidebar">{anterior.tipo}</span>
                  <span className="text-brand-muted">{formatearFechaCorta(anterior.cita.fecha)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
