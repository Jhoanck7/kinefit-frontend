import { Roboto } from "next/font/google";

import { Card } from "@/components/ui";
import { formatearFechaExtensa } from "@/lib/formato";
import { contenidoService } from "@/services";

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

interface DocumentoLegalViewProps {
  titulo: string;
  clave: string;
}

/** Muestra un documento legal del sitio con el texto que se configura desde el panel */
export default async function DocumentoLegalView({
  titulo,
  clave,
}: DocumentoLegalViewProps) {
  const res = await contenidoService.getAll().catch(() => null);
  const documento = res?.data?.data?.find(c => c.clave === clave);
  const texto = documento?.valor.trim() ?? "";

  return (
    <div className={`${roboto.className} mx-auto max-w-3xl px-4 py-12 sm:px-6`}>
      <div className="mb-8">
        <h1 className="text-lg font-bold text-slate-900">{titulo}</h1>
        {texto && documento && (
          <p className="mt-1 text-xs text-slate-500">
            Última actualización:{" "}
            {formatearFechaExtensa(new Date(documento.updatedAt))}
          </p>
        )}
      </div>

      <Card className="border border-slate-200 rounded-none p-6 sm:p-8">
        {texto ? (
          <p className="whitespace-pre-line text-sm text-slate-700 leading-relaxed">
            {texto}
          </p>
        ) : (
          <p className="text-sm text-slate-500">
            Este documento aún no está disponible.
          </p>
        )}
      </Card>
    </div>
  );
}
