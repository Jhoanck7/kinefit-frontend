import "./globals.css";

import Link from "next/link";

import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white font-satoshi">
      <div className="max-w-md w-full border border-slate-200 p-8 text-center rounded-global">
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
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </main>
  );
}
