interface BloquesSelectorProps {
  horas: string[];
  horasSeleccionadas: string[];
  onSeleccionar: (hora: string) => void;
}

export function BloquesSelector({
  horas,
  horasSeleccionadas,
  onSeleccionar,
}: BloquesSelectorProps) {
  if (horas.length === 0) {
    return (
      <p className="font-sans text-xs text-slate-400">
        Sin horarios disponibles en este tramo.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {horas.map(hora => {
        const seleccionado = horasSeleccionadas.includes(hora);
        return (
          <button
            key={hora}
            type="button"
            onClick={() => onSeleccionar(hora)}
            className={`flex items-center justify-center gap-1 rounded-none border px-2 py-2 text-xs font-sans transition-colors ${
              seleccionado
                ? "border-primary bg-primary text-primary-foreground font-bold"
                : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span>{hora}</span>
            {seleccionado && <span className="text-[10px] font-bold">✓</span>}
          </button>
        );
      })}
    </div>
  );
}
