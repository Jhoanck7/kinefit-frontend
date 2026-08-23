import "./globals.css";

import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white font-satoshi">
        <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full border border-slate-200 p-8 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Error 404
            </p>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">
              No encontramos esta página
            </h1>
            <p className="text-sm text-slate-500 mb-6">
              El enlace puede estar roto o la página puede haberse movido.
            </p>
            <Button asChild>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/">Volver al inicio</a>
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}
