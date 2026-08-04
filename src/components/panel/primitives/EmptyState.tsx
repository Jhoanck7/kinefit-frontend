import { ReactNode } from "react";

/** Estado vacío de cualquier listado o de la agenda (G-13). */
export function EmptyState({
  titulo,
  descripcion,
  accion,
  icono,
}: {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
  icono?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {icono ?? (
        <svg
          className="h-10 w-10 text-brand-border"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 13.5h6m-6 3h3.75M6.75 21h10.5A2.25 2.25 0 0019.5 18.75V5.25A2.25 2.25 0 0017.25 3H6.75A2.25 2.25 0 004.5 5.25v13.5A2.25 2.25 0 006.75 21z"
          />
        </svg>
      )}
      <p className="text-sm font-semibold text-panel-sidebar">{titulo}</p>
      {descripcion && <p className="text-sm text-brand-muted max-w-sm">{descripcion}</p>}
      {accion}
    </div>
  );
}
