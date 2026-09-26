import Image from "next/image";

import { Badge } from "@/components/ui";
import { EspecialistaResponse } from "@/models/responses";

interface EspecialistaCardProps {
  especialista: EspecialistaResponse;
  tieneCuenta: boolean;
  cambiandoEstado: boolean;
  onClick: () => void;
  onCrearCuenta: () => void;
  onConfigurarHorario: () => void;
  onToggleEstado: () => void;
}

export function EspecialistaCard({
  especialista: esp,
  tieneCuenta,
  cambiandoEstado,
  onClick,
  onCrearCuenta,
  onConfigurarHorario,
  onToggleEstado,
}: EspecialistaCardProps) {
  return (
    <div
      className="bg-white rounded-none border border-slate-200 cursor-pointer hover:border-primary/50 transition-all group flex flex-col justify-between"
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-3 text-center mb-4 relative pt-8 px-4">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 border border-slate-200 group-hover:border-primary/50 transition-colors shrink-0">
          {esp.fotoUrl ? (
            <Image
              src={esp.fotoUrl}
              alt={esp.nombre}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-2xl">
              {esp.nombre.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h2 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
            {esp.nombre}
          </h2>
          <p className="text-sm text-primary font-semibold">{esp.cargo}</p>
          {esp.servicios.length > 0 && (
            <p className="text-xs text-slate-500 mt-0.5">
              {esp.servicios.map(s => s.nombre).join(", ")}
            </p>
          )}
        </div>
      </div>
      <div className="bg-slate-50 border-t border-slate-200 p-4 rounded-none flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <Badge
            className={`rounded-overlay border-0 text-white ${esp.activo ? "bg-emerald-700" : "bg-slate-400"}`}
          >
            {esp.activo ? "Activo" : "Inactivo"}
          </Badge>
          <button
            type="button"
            disabled={cambiandoEstado}
            onClick={e => {
              e.stopPropagation();
              onToggleEstado();
            }}
            className="font-bold text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            {cambiandoEstado
              ? "Guardando…"
              : esp.activo
                ? "Desactivar"
                : "Activar"}
          </button>
        </div>
        <div className="flex flex-col items-end gap-1">
          {esp.activo && !esp.tieneHorario && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onConfigurarHorario();
              }}
              className="font-bold text-amber-700 hover:underline"
            >
              Sin horario cargado, configurar
            </button>
          )}
          {esp.activo && !tieneCuenta && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onCrearCuenta();
              }}
              className="font-bold text-amber-700 hover:underline"
            >
              Sin cuenta de acceso, crear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
