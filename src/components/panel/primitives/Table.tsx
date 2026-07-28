import { ReactNode } from "react";
import { Card } from "./Card";

export interface ColumnaTabla {
  titulo: string;
  className?: string;
}

/** Tabla con cabecera azul tenue y paginación (B.9, B.10). */
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
    <Card className="p-0 overflow-hidden">
      {encabezado && <div className="px-6 py-4 border-b border-brand-border">{encabezado}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-panel-seleccion">
            <tr>
              {columnas.map((columna) => (
                <th
                  key={columna.titulo}
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-muted ${columna.className ?? ""}`}
                >
                  {columna.titulo}
                </th>
              ))}
              <th scope="col" className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">{children}</tbody>
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
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="cursor-pointer hover:bg-panel-fondo transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-panel-sidebar"
    >
      {children}
    </tr>
  );
}

export function CeldaChevron() {
  return (
    <td className="px-4 py-3 text-right">
      <svg className="inline h-4 w-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
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
    <div className="flex items-center justify-between border-t border-brand-border px-6 py-3">
      <p className="text-sm text-brand-muted">
        Mostrando {inicio}–{fin} de {total}
      </p>
      <div className="flex overflow-hidden rounded-lg border border-brand-border">
        <button
          type="button"
          onClick={onAnterior}
          disabled={!puedeAnterior}
          aria-label="Página anterior"
          className="px-3 py-1.5 text-panel-sidebar hover:bg-panel-fondo disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={onSiguiente}
          disabled={!puedeSiguiente}
          aria-label="Página siguiente"
          className="px-3 py-1.5 border-l border-brand-border text-panel-sidebar hover:bg-panel-fondo disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
        >
          ›
        </button>
      </div>
    </div>
  );
}
