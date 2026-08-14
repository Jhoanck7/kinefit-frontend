import { ReactNode } from "react";

import { Card } from "./Card";

export interface ColumnaTabla {
  titulo: string;
  className?: string;
}

/**
 * Tabla con estilo Frameless Satoshi:
 * - Cabecera tenue bg-slate-50
 * - Etiquetas micro-técnicas en mayúsculas y text-slate-400
 * - Paginación ortogonal y limpia
 */
export function Table({
  columnas,
  children,
  encabezado,
  pie,
}: {
  columnas: ColumnaTabla[];
  children: ReactNode;
  encabezado?: ReactNode;
  pie?: ReactNode;
}) {
  return (
    <Card className="p-0 overflow-hidden rounded-none border-slate-200 shadow-none font-sans">
      {encabezado && (
        <div className="px-6 py-3.5 border-b border-slate-200 bg-white font-sans">
          {encabezado}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-sans">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              {columnas.map(columna => (
                <th
                  key={columna.titulo}
                  scope="col"
                  className={`px-4 py-3 text-left font-sans text-[11px] font-medium uppercase tracking-wider text-slate-400 ${columna.className ?? ""}`}
                >
                  {columna.titulo}
                </th>
              ))}
              <th scope="col" className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {children}
          </tbody>
        </table>
      </div>
      {pie}
    </Card>
  );
}

export function FilaTabla({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: ReactNode;
}) {
  if (!onClick) {
    return <tr>{children}</tr>;
  }
  return (
    <tr
      onClick={onClick}
      tabIndex={0}
      role="button"
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="cursor-pointer hover:bg-slate-50/70 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-slate-900 font-sans"
    >
      {children}
    </tr>
  );
}

export function CeldaChevron() {
  return (
    <td className="px-4 py-3 text-right">
      <svg
        className="inline h-4 w-4 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </td>
  );
}

export function Paginacion({
  inicio,
  fin,
  total,
  onAnterior,
  onSiguiente,
  puedeAnterior,
  puedeSiguiente,
}: {
  inicio: number;
  fin: number;
  total: number;
  onAnterior: () => void;
  onSiguiente: () => void;
  puedeAnterior: boolean;
  puedeSiguiente: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 bg-white font-sans">
      <p className="text-xs text-slate-500 font-medium">
        Mostrando {inicio}–{fin} de {total}
      </p>
      <div className="flex overflow-hidden rounded-none border border-slate-200 divide-x divide-slate-200">
        <button
          type="button"
          onClick={onAnterior}
          disabled={!puedeAnterior}
          aria-label="Página anterior"
          className="px-3 py-1 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={onSiguiente}
          disabled={!puedeSiguiente}
          aria-label="Página siguiente"
          className="px-3 py-1 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none"
        >
          ›
        </button>
      </div>
    </div>
  );
}
