import { HitosCitaResponse } from "@/models/responses";

interface HitosBoardProps {
  hitos: HitosCitaResponse;
  onIrADocumentos: () => void;
  onCobrar: () => void;
}

export function HitosBoard({
  hitos,
  onIrADocumentos,
  onCobrar,
}: HitosBoardProps) {
  const items: {
    etiqueta: string;
    listo: boolean;
    onClick?: () => void;
  }[] = [
    { etiqueta: "Anticipo Pagado", listo: hitos.anticipoPagado },
    {
      etiqueta: "Pago Total Registrado",
      listo: hitos.pagoTotalRegistrado,
      onClick: hitos.pagoTotalRegistrado ? undefined : onCobrar,
    },
    {
      etiqueta: "Documentos Firmados",
      listo: hitos.documentosFirmados,
      onClick: onIrADocumentos,
    },
    {
      etiqueta: "Recomendaciones Enviadas",
      listo: hitos.recomendacionesEnviadas,
    },
  ];

  return (
    <ol className="flex items-start w-full border-b border-slate-200 bg-slate-50/60 p-4 font-sans">
      {items.map((item, indice) => (
        <li
          key={item.etiqueta}
          className="flex-1 flex flex-col items-center relative"
        >
          {indice > 0 && (
            <span
              className={`absolute top-3.5 right-1/2 w-full h-px -z-10 ${
                items[indice - 1].listo && item.listo
                  ? "bg-primary"
                  : "bg-slate-200"
              }`}
              aria-hidden
            />
          )}
          <button
            type="button"
            onClick={item.onClick}
            disabled={!item.onClick}
            className="flex flex-col items-center gap-1.5 disabled:cursor-default"
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold font-sans ${
                item.listo
                  ? "bg-primary text-white"
                  : "border border-slate-200 bg-white text-slate-400"
              }`}
            >
              {item.listo ? "✓" : indice + 1}
            </span>
            <span
              className={`text-label font-bold text-center ${
                item.listo ? "text-foreground" : "text-slate-400"
              }`}
            >
              {item.etiqueta}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}
