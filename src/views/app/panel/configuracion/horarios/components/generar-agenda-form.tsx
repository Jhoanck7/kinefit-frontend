"use client";

import { useState } from "react";

import { Alerta } from "@/components/shared";
import { Button, Card } from "@/components/ui";
import { useGenerarAgendaMutation, useGetEspecialistas } from "@/hooks/api";
import { handleApiError } from "@/lib/api";

export function GenerarAgendaForm() {
  const { data: especialistas = [] } = useGetEspecialistas(undefined, true);
  const generarMutation = useGenerarAgendaMutation();

  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [especialistaId, setEspecialistaId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleGenerar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desde || !hasta) return;
    setError(null);
    try {
      await generarMutation.mutateAsync({
        desde,
        hasta,
        especialistaId: especialistaId ? Number(especialistaId) : undefined,
      });
    } catch (err: unknown) {
      setError(handleApiError(err).message);
    }
  };

  const resultado = generarMutation.data;

  return (
    <Card className="rounded-none border-slate-200 shadow-none p-5">
      <p className="mb-3 font-sans font-medium text-sm text-slate-900 border-b border-slate-200 pb-2">
        Generar Agenda
      </p>
      <p className="mb-4 font-sans text-xs text-slate-500">
        Crea los bloques de agenda del rango de fechas indicado, por
        intersección del horario del centro, la plantilla de cada especialista y
        los bloqueos vigentes.
      </p>

      {error && (
        <Alerta tono="error" className="mb-4">
          {error}
        </Alerta>
      )}

      <form onSubmit={handleGenerar} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Desde
          </label>
          <input
            type="date"
            value={desde}
            onChange={e => setDesde(e.target.value)}
            required
            className="rounded-none border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Hasta
          </label>
          <input
            type="date"
            value={hasta}
            onChange={e => setHasta(e.target.value)}
            required
            className="rounded-none border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Especialista
          </label>
          <select
            value={especialistaId}
            onChange={e => setEspecialistaId(e.target.value)}
            className="rounded-none border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
          >
            <option value="">Todos los activos</option>
            {especialistas.map(esp => (
              <option key={esp.id} value={esp.id}>
                {esp.nombre}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={generarMutation.isPending}>
          {generarMutation.isPending ? "Generando..." : "Generar Agenda"}
        </Button>
      </form>

      {resultado && (
        <div className="mt-4 border-t border-slate-200 pt-4 font-sans text-xs text-slate-700 space-y-2">
          <p>
            <span className="font-bold text-slate-900">
              {resultado.bloquesCreados}
            </span>{" "}
            bloques creados ·{" "}
            <span className="font-bold text-slate-900">
              {resultado.bloquesYaExistentes}
            </span>{" "}
            ya existían
          </p>
          {resultado.conflictos.length > 0 && (
            <div className="space-y-1">
              <p className="font-bold text-amber-700">
                {resultado.conflictos.length} conflicto(s):
              </p>
              <ul className="list-disc pl-4 space-y-0.5">
                {resultado.conflictos.map((c, i) => (
                  <li key={i}>
                    Especialista #{c.especialistaId} · {c.fecha}{" "}
                    {c.horaInicio.substring(0, 5)}–{c.horaFin.substring(0, 5)} —{" "}
                    {c.motivo}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
