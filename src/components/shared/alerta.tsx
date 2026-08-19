const FONDO_POR_TONO = {
  error: "bg-red-700",
  advertencia: "bg-amber-600",
  exito: "bg-emerald-700",
  info: "bg-blue-800",
} as const;

export type TonoAlerta = keyof typeof FONDO_POR_TONO;

export function Alerta({
  tono = "error",
  className = "",
  children,
}: {
  tono?: TonoAlerta;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role={tono === "error" ? "alert" : "status"}
      className={`${FONDO_POR_TONO[tono]} rounded-none p-3 font-sans text-xs font-semibold text-white ${className}`}
    >
      {children}
    </div>
  );
}
