"use client";

import { useState } from "react";

import { formatearRangoHorario } from "@/lib/formato";

const DIAS: { id: number; etiqueta: string }[] = [
  { id: 1, etiqueta: "Lunes" },
  { id: 2, etiqueta: "Martes" },
  { id: 3, etiqueta: "Miércoles" },
  { id: 4, etiqueta: "Jueves" },
  { id: 5, etiqueta: "Viernes" },
  { id: 6, etiqueta: "Sábado" },
  { id: 0, etiqueta: "Domingo" },
];

interface BloqueSemana {
  id: number;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
}

interface BloquesSemanaEditorProps {
  bloques: BloqueSemana[];
  onAgregar: (diaSemana: number, horaInicio: string, horaFin: string) => void;
  onEliminar: (id: number) => void;
  eliminandoId?: number | null;
}

export function BloquesSemanaEditor({
  bloques,
  onAgregar,
  onEliminar,
  eliminandoId,
}: BloquesSemanaEditorProps) {
  const [horaInicio, setHoraInicio] = useState<Record<number, string>>({});
  const [horaFin, setHoraFin] = useState<Record<number, string>>({});

  const handleAgregar = (dia: number) => {
    const inicio = horaInicio[dia];
    const fin = horaFin[dia];
    if (!inicio || !fin) return;
    onAgregar(dia, inicio, fin);
    setHoraInicio(prev => ({ ...prev, [dia]: "" }));
    setHoraFin(prev => ({ ...prev, [dia]: "" }));
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-7 sm:gap-2">
      {DIAS.map(dia => {
        const bloquesDia = bloques
          .filter(b => b.diaSemana === dia.id)
          .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

        return (
          <div
            key={dia.id}
            className="border border-slate-200 bg-slate-50/50 p-2.5 rounded-none flex flex-col gap-1.5"
          >
            <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
              {dia.etiqueta}
            </p>

            {bloquesDia.length === 0 ? (
              <p className="font-sans text-xs text-slate-400 italic text-center">
                No atiende
              </p>
            ) : (
              bloquesDia.map(bloque => (
                <div
                  key={bloque.id}
                  className="flex items-center justify-between gap-1 font-sans text-xs font-medium text-slate-800"
                >
                  <span>
                    {formatearRangoHorario(
                      bloque.horaInicio.substring(0, 5),
                      bloque.horaFin.substring(0, 5)
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEliminar(bloque.id)}
                    disabled={eliminandoId === bloque.id}
                    className="text-slate-400 hover:text-red-700 font-bold leading-none"
                    title="Eliminar bloque"
                  >
                    {eliminandoId === bloque.id ? "…" : "×"}
                  </button>
                </div>
              ))
            )}

            <div className="mt-1 flex flex-col gap-1 border-t border-slate-200 pt-1.5">
              <input
                type="time"
                value={horaInicio[dia.id] || ""}
                onChange={e =>
                  setHoraInicio(prev => ({
                    ...prev,
                    [dia.id]: e.target.value,
                  }))
                }
                className="w-full rounded-none border border-slate-200 bg-white px-1 py-0.5 text-[11px] text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
              />
              <input
                type="time"
                value={horaFin[dia.id] || ""}
                onChange={e =>
                  setHoraFin(prev => ({ ...prev, [dia.id]: e.target.value }))
                }
                className="w-full rounded-none border border-slate-200 bg-white px-1 py-0.5 text-[11px] text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
              />
              <button
                type="button"
                onClick={() => handleAgregar(dia.id)}
                className="text-[11px] font-bold text-blue-900 hover:underline"
              >
                + Agregar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
