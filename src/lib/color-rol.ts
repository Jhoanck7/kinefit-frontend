import type { ColorRolEstado } from "@/lib/estados";

export interface ColorEstado {
  dot: string;
  texto: string;
  fondoSuave: string;
  fondoSuaveHover: string;
  fondoSolido: string;
}

export const COLOR_ROL: Record<ColorRolEstado, ColorEstado> = {
  "azul-seleccion": {
    dot: "bg-blue-600",
    texto: "text-blue-700",
    fondoSuave: "bg-blue-50/90",
    fondoSuaveHover: "hover:bg-blue-100/90",
    fondoSolido: "#2563eb",
  },
  ambar: {
    dot: "bg-amber-500",
    texto: "text-amber-700",
    fondoSuave: "bg-amber-50/90",
    fondoSuaveHover: "hover:bg-amber-100/90",
    fondoSolido: "#b45309",
  },
  verde: {
    dot: "bg-emerald-500",
    texto: "text-emerald-700",
    fondoSuave: "bg-emerald-50/90",
    fondoSuaveHover: "hover:bg-emerald-100/90",
    fondoSolido: "#15803d",
  },
  "azul-profundo": {
    dot: "bg-indigo-700",
    texto: "text-indigo-800",
    fondoSuave: "bg-indigo-50/90",
    fondoSuaveHover: "hover:bg-indigo-100/90",
    fondoSolido: "#07336c",
  },
  rojo: {
    dot: "bg-red-500",
    texto: "text-red-700",
    fondoSuave: "bg-rose-50/90",
    fondoSuaveHover: "hover:bg-rose-100/90",
    fondoSolido: "#b91c1c",
  },
  gris: {
    dot: "bg-slate-400",
    texto: "text-slate-600",
    fondoSuave: "bg-slate-100/90",
    fondoSuaveHover: "hover:bg-slate-200/90",
    fondoSolido: "#475569",
  },
};
