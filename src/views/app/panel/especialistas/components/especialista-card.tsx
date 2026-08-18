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
      className="bg-white rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-brand-primary/50 transition-all hover:shadow-lg group flex flex-col justify-between"
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-3 text-center mb-4 relative pt-8 px-4">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-md group-hover:border-brand-primary/20 transition-colors shrink-0">
          {esp.fotoUrl ? (
            <Image
              src={esp.fotoUrl}
              alt={esp.nombre}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-brand-primary text-white font-bold text-2xl">
              {esp.nombre.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-lg group-hover:text-brand-primary transition-colors">
            {esp.nombre}
          </h2>
          <p className="text-sm text-brand-primary font-semibold">
            {esp.cargo}
          </p>
          {esp.servicios.length > 0 && (
            <p className="text-xs text-slate-500 mt-0.5">
              {esp.servicios.map(s => s.nombre).join(", ")}
            </p>
          )}
        </div>
      </div>
      <div className="bg-slate-50 border-t border-slate-100 p-4 rounded-b-2xl flex justify-between items-center text-xs">
        <span
          className={`px-2.5 py-1 rounded-full font-bold ${esp.activo ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}
        >
          {esp.activo ? "● Activo" : "○ Inactivo"}
        </span>
      </div>
    </div>
  );
}
