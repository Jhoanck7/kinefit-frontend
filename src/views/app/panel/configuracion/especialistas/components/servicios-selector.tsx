import { ServicioResponse } from "@/models/responses";

interface ServiciosSelectorProps {
  servicios: ServicioResponse[];
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
    <div className="space-y-1.5 rounded-none border border-slate-200 p-3">
      {servicios.map(srv => (
        <label
          key={srv.id}
          className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={seleccionados.includes(srv.id)}
            onChange={() => alternar(srv.id)}
            className="rounded border-slate-200"
          />
          {srv.nombre}
        </label>
      ))}
    </div>
  );
}
