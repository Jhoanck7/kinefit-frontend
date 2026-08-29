import { HitosCitaResponse } from "@/models/responses";

interface HitosBoardProps {
  hitos: HitosCitaResponse;
  onIrADocumentos: () => void;
}

export function HitosBoard({ hitos, onIrADocumentos }: HitosBoardProps) {
  const items: {
    etiqueta: string;
    listo: boolean;
    onClick?: () => void;
  }[] = [
    { etiqueta: "Anticipo pagado", listo: hitos.anticipoPagado },
    { etiqueta: "Pago total registrado", listo: hitos.pagoTotalRegistrado },
    {
      etiqueta: "Documentos firmados",
      listo: hitos.documentosFirmados,
      onClick: onIrADocumentos,
    },
    {
      etiqueta: "Recomendaciones enviadas",
      listo: hitos.recomendacionesEnviadas,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 border-b border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-4">
      {items.map(item => (
        <button
          key={item.etiqueta}
          type="button"
          onClick={item.onClick}
          disabled={!item.onClick}
          className="flex items-center gap-2 text-left disabled:cursor-default"
        >
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              item.listo ? "bg-emerald-500" : "bg-slate-300"
            }`}
            aria-hidden
          />
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            {item.etiqueta}
          </span>
        </button>
      ))}
    </div>
  );
}
