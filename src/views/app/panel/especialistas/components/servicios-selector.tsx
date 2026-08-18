import { BackendService } from "@/types";

interface ServiciosSelectorProps {
  servicios: BackendService[];
  seleccionados: number[];
  onCambiar: (ids: number[]) => void;
}

export function ServiciosSelector({
  servicios,
  seleccionados,
  onCambiar,
}: ServiciosSelectorProps) {
  function alternar(id: number) {
    onCambiar(
      seleccionados.includes(id)
        ? seleccionados.filter(s => s !== id)
        : [...seleccionados, id]
    );
  }

  return (
    <div className="space-y-1.5 rounded-xl border border-brand-border p-3">
      {servicios.map(srv => (
        <label
          key={srv.id}
          className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={seleccionados.includes(srv.id)}
            onChange={() => alternar(srv.id)}
            className="rounded border-brand-border"
          />
          {srv.nombre}
        </label>
      ))}
    </div>
  );
}
