import Image from "next/image";

import { EspecialistaResponse } from "@/models/responses";

interface EspecialistaCardProps {
  especialista: EspecialistaResponse;
  onClick: () => void;
}

export function EspecialistaCard({
  especialista: esp,
  onClick,
}: EspecialistaCardProps) {
  return (
    <div
      className="bg-white rounded-none border border-slate-200 cursor-pointer hover:border-blue-900/50 transition-all group flex flex-col justify-between"
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-3 text-center mb-4 relative pt-8 px-4">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 border border-slate-200 group-hover:border-blue-900/50 transition-colors shrink-0">
          {esp.fotoUrl ? (
            <Image
              src={esp.fotoUrl}
              alt={esp.nombre}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-900 text-white font-bold text-2xl">
              {esp.nombre.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-lg group-hover:text-blue-900 transition-colors">
            {esp.nombre}
          </h2>
          <p className="text-sm text-blue-900 font-semibold">{esp.cargo}</p>
          {esp.servicios.length > 0 && (
            <p className="text-xs text-slate-500 mt-0.5">
              {esp.servicios.map(s => s.nombre).join(", ")}
            </p>
          )}
        </div>
      </div>
      <div className="bg-slate-50 border-t border-slate-200 p-4 rounded-none flex justify-between items-center text-xs">
        <span
          className={`flex items-center gap-1.5 font-bold ${esp.activo ? "text-emerald-700" : "text-slate-500"}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${esp.activo ? "bg-emerald-700" : "bg-slate-400"}`}
            aria-hidden
          />
          {esp.activo ? "Activo" : "Inactivo"}
        </span>
      </div>
    </div>
  );
}
