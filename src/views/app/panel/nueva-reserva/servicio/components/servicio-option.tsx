interface ServicioOptionProps {
  titulo: string;
  seleccionado: boolean;
  onClick: () => void;
}

export function ServicioOption({
  titulo,
  seleccionado,
  onClick,
}: ServicioOptionProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between rounded-none border px-4 py-3 transition-colors cursor-pointer ${
        seleccionado
          ? "border-primary bg-blue-50/80 text-blue-950"
          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-900"
      }`}
    >
      <p className="font-sans font-medium text-sm">{titulo}</p>

      <div
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-none border ${
          seleccionado
            ? "border-primary bg-primary text-primary-foreground"
            : "border-slate-300 bg-white"
        }`}
      >
        {seleccionado && <span className="text-[10px] font-bold">✓</span>}
      </div>
    </div>
  );
}
