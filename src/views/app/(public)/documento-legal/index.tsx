import { Roboto } from "next/font/google";

import { Card } from "@/components/ui";
import { leerSeccionesDocumentoLegal } from "@/lib/documento-legal";
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

/** Muestra un documento legal del sitio con las secciones que se configuran desde el panel */
export default async function DocumentoLegalView({
  titulo,
  clave,
}: DocumentoLegalViewProps) {
  const res = await contenidoService.getAll().catch(() => null);
  const documento = res?.data?.data?.find(c => c.clave === clave);
  const secciones = leerSeccionesDocumentoLegal(documento?.valor).filter(
    s => s.titulo.trim() || s.texto.trim()
  );

  return (
    <div className={`${roboto.className} mx-auto max-w-3xl px-4 py-12 sm:px-6`}>
      <div className="mb-8">
        <h1 className="text-lg font-bold text-slate-900">{titulo}</h1>
        {secciones.length > 0 && documento && (
          <p className="mt-1 text-xs text-slate-500">
            Última actualización:{" "}
            {formatearFechaExtensa(new Date(documento.updatedAt))}
          </p>
        )}
      </div>

      <Card className="border border-slate-200 rounded-none p-6 sm:p-8 space-y-8">
        {secciones.length > 0 ? (
          secciones.map((seccion, idx) => (
            <div key={idx}>
              {seccion.titulo.trim() && (
                <h2 className="border-b border-slate-200 pb-2 mb-3 text-sm font-bold uppercase tracking-wider text-slate-900">
                  {seccion.titulo}
                </h2>
              )}
              <p className="whitespace-pre-line text-sm text-slate-700 leading-relaxed">
                {seccion.texto}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">
            Este documento aún no está disponible.
          </p>
        )}
      </Card>
    </div>
  );
}
