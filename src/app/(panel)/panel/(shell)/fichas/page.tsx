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
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Barra de Filtros en Card idéntica a la sección de Ventas */}
      <Card>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-panel-sidebar">
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
            <span className="font-semibold text-brand-muted text-sm">Tipo:</span>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="rounded-lg border border-brand-border bg-panel-fondo px-3 py-2 text-sm font-medium text-panel-sidebar transition-colors focus:border-panel-sidebar focus:bg-white focus:outline-none"
            >
              <option value="">Todos los tipos</option>
              {formatos.map((f) => (
                <option key={f.id} value={f.nombre}>
                  {f.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Rango de Fechas (Desde / Hasta) */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-brand-muted text-sm">Desde:</span>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="rounded-lg border border-brand-border bg-panel-fondo px-3 py-2 text-sm font-medium text-panel-sidebar transition-colors focus:border-panel-sidebar focus:bg-white focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-brand-muted text-sm">Hasta:</span>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="rounded-lg border border-brand-border bg-panel-fondo px-3 py-2 text-sm font-medium text-panel-sidebar transition-colors focus:border-panel-sidebar focus:bg-white focus:outline-none cursor-pointer"
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variante="secundario" className="px-4 py-2 text-sm" onClick={() => router.push("/panel/fichas/formatos")}>
              Formatos de ficha
            </Button>
            <Button variante="primario" className="px-4 py-2 text-sm" onClick={() => router.push("/panel/fichas/nueva/reserva")}>
              Nueva ficha
            </Button>
          </div>
        </div>
      </Card>

      <Table
        columnas={COLUMNAS}
        encabezado={<p className="font-bold text-panel-sidebar">{total} fichas registradas</p>}
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
            <td className="px-4 py-3 font-medium text-panel-sidebar">
              {ficha.paciente.nombre} {ficha.paciente.apellido}
            </td>
            <td className="px-4 py-3 text-brand-muted">{ficha.paciente.rut}</td>
            <td className="px-4 py-3">
              <NeutralBadge>{ficha.tipo}</NeutralBadge>
            </td>
            <td className="px-4 py-3 text-brand-muted">{formatearFechaCorta(ficha.cita.fecha)}</td>
            <td className="px-4 py-3 text-brand-muted">
              {formatearFechaCorta(ficha.cita.fecha)} | {formatearRangoHorario(ficha.cita.horaInicio, ficha.cita.horaTermino)}
            </td>
            <td className="px-4 py-3 text-brand-muted">{ficha.registradaPor}</td>
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
