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
