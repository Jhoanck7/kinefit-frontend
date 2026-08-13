"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useHoyPanel } from "@/lib/panel/reloj";
import { listFichas, FichaResuelta } from "@/lib/panel/data/fichas";
import { listFormatos, FormatoResuelto } from "@/lib/panel/data/formatos";
import { formatearFechaCorta, formatearRangoHorario } from "@/lib/panel/domain/formato";
import { Button } from "@/components/panel/primitives/Button";
import { Card } from "@/components/panel/primitives/Card";
import { SearchInput } from "@/components/panel/primitives/CamposFormulario";
import { NeutralBadge } from "@/components/panel/primitives/Badge";
import { EmptyState } from "@/components/panel/primitives/EmptyState";
import { Table, FilaTabla, CeldaChevron, Paginacion } from "@/components/panel/primitives/Table";
import { FichaDetalleModal } from "@/components/panel/domain/FichaDetalleModal";

const TAMANO_PAGINA = 8;

const COLUMNAS = [
  { titulo: "Paciente" },
  { titulo: "RUT" },
  { titulo: "Tipo de ficha" },
  { titulo: "Fecha de atención" },
  { titulo: "Reserva asociada" },
  { titulo: "Registrada por" },
];

function FichasContenido() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hoy = useHoyPanel();

  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [fichas, setFichas] = useState<FichaResuelta[] | null>(null);
  const [formatos, setFormatos] = useState<FormatoResuelto[]>([]);
  const [pagina, setPagina] = useState(1);

  const fichaModalId = searchParams.get("ficha");

  useEffect(() => {
    if (!hoy) return;
    listFormatos(hoy).then(setFormatos);
  }, [hoy]);

  useEffect(() => {
    if (!hoy) return;
    listFichas(hoy, {
      termino: busqueda,
      tipo: tipo || undefined,
      desde: desde ? new Date(`${desde}T00:00:00`) : undefined,
      hasta: hasta ? new Date(`${hasta}T23:59:59`) : undefined,
    }).then((resultado) => {
      setFichas(resultado);
      setPagina(1);
    });
  }, [hoy, busqueda, tipo, desde, hasta]);

  function abrirParametros(params: Record<string, string | undefined>) {
    const actuales = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([clave, valor]) => {
      if (valor === undefined) actuales.delete(clave);
      else actuales.set(clave, valor);
    });
    const query = actuales.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  if (!hoy || fichas === null) return <div aria-hidden />;

  const total = fichas.length;
  const inicio = (pagina - 1) * TAMANO_PAGINA;
  const visibles = fichas.slice(inicio, inicio + TAMANO_PAGINA);

  return (
    <div className="mx-auto max-w-6xl space-y-4 font-sans shadow-none">
      {/* Barra de Filtros en Card Frameless */}
      <Card className="p-4 rounded-none border-slate-200 shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Buscador de Paciente / RUT */}
          <div className="w-64 min-w-[200px]">
            <SearchInput
              placeholder="Buscar por paciente o RUT..."
              value={busqueda}
              onChange={setBusqueda}
            />
          </div>

          {/* Filtro Tipo de Ficha */}
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-slate-400 uppercase tracking-wider text-[11px]">Tipo:</span>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="rounded-none border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-slate-900 focus:outline-none"
            >
              <option value="">TODOS LOS TIPOS</option>
              {formatos.map((f) => (
                <option key={f.id} value={f.nombre}>
                  {f.nombre.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Rango de Fechas (Desde / Hasta) */}
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-slate-400 uppercase tracking-wider text-[11px]">Desde:</span>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="rounded-none border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800 focus:border-slate-900 focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-medium text-slate-400 uppercase tracking-wider text-[11px]">Hasta:</span>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="rounded-none border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800 focus:border-slate-900 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variante="secundario" className="px-3.5 py-2 text-xs" onClick={() => router.push("/panel/fichas/formatos")}>
              FORMATOS DE FICHA
            </Button>
            <Button variante="primario" className="px-4 py-2 text-xs" onClick={() => router.push("/panel/fichas/nueva/reserva")}>
              NUEVA FICHA
            </Button>
          </div>
        </div>
      </Card>

      <Table
        columnas={COLUMNAS}
        encabezado={<p className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">{total} fichas registradas</p>}
        pie={
          total > 0 ? (
            <Paginacion
              inicio={inicio + 1}
              fin={Math.min(inicio + TAMANO_PAGINA, total)}
              total={total}
              onAnterior={() => setPagina((p) => Math.max(1, p - 1))}
              onSiguiente={() => setPagina((p) => (inicio + TAMANO_PAGINA < total ? p + 1 : p))}
              puedeAnterior={pagina > 1}
              puedeSiguiente={inicio + TAMANO_PAGINA < total}
            />
          ) : undefined
        }
      >
        {visibles.map((ficha) => (
          <FilaTabla key={ficha.id} onClick={() => abrirParametros({ ficha: ficha.id })}>
            <td className="px-4 py-3 font-sans font-medium text-sm text-slate-900">
              {ficha.paciente.nombre} {ficha.paciente.apellido}
            </td>
            <td className="px-4 py-3 font-sans font-medium text-sm text-slate-700">{ficha.paciente.rut || "—"}</td>
            <td className="px-4 py-3">
              <NeutralBadge>{ficha.tipo}</NeutralBadge>
            </td>
            <td className="px-4 py-3 font-sans font-medium text-sm text-slate-700">{formatearFechaCorta(ficha.cita.fecha)}</td>
            <td className="px-4 py-3 font-sans font-medium text-sm text-slate-700">
              {formatearFechaCorta(ficha.cita.fecha)} · {formatearRangoHorario(ficha.cita.horaInicio, ficha.cita.horaTermino)}
            </td>
            <td className="px-4 py-3 font-sans font-medium text-sm text-slate-700">{ficha.registradaPor}</td>
            <CeldaChevron />
          </FilaTabla>
        ))}
      </Table>

      {total === 0 && (
        <EmptyState
          titulo="Sin resultados"
          descripcion="Ninguna ficha coincide con la búsqueda o el filtro seleccionado."
        />
      )}

      <FichaDetalleModal
        fichaId={fichaModalId}
        hoy={hoy}
        onCerrar={() => abrirParametros({ ficha: undefined })}
        onSeleccionarFicha={(id) => abrirParametros({ ficha: id })}
      />
    </div>
  );
}

export default function FichasPage() {
  return (
    <Suspense fallback={<div aria-hidden />}>
      <FichasContenido />
    </Suspense>
  );
}
