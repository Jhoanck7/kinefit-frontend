"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHoyPanel } from "@/lib/panel/reloj";
import { listFichas, FichaResuelta } from "@/lib/panel/data/fichas";
import { listFormatos, FormatoResuelto } from "@/lib/panel/data/formatos";
import { formatearFechaCorta, formatearRangoHorario } from "@/lib/panel/domain/formato";
import { Button } from "@/components/panel/primitives/Button";
import { SearchInput, SelectField } from "@/components/panel/primitives/CamposFormulario";
import { NeutralBadge } from "@/components/panel/primitives/Badge";
import { EmptyState } from "@/components/panel/primitives/EmptyState";
import { Table, FilaTabla, CeldaChevron, Paginacion } from "@/components/panel/primitives/Table";

const TAMANO_PAGINA = 8;

const COLUMNAS = [
  { titulo: "Paciente" },
  { titulo: "RUT" },
  { titulo: "Tipo de ficha" },
  { titulo: "Fecha de atención" },
  { titulo: "Reserva asociada" },
  { titulo: "Registrada por" },
];

export default function FichasPage() {
  const router = useRouter();
  const hoy = useHoyPanel();
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [fichas, setFichas] = useState<FichaResuelta[] | null>(null);
  const [formatos, setFormatos] = useState<FormatoResuelto[]>([]);
  const [pagina, setPagina] = useState(1);

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

  if (!hoy || fichas === null) return <div aria-hidden />;

  const total = fichas.length;
  const inicio = (pagina - 1) * TAMANO_PAGINA;
  const visibles = fichas.slice(inicio, inicio + TAMANO_PAGINA);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="max-w-md flex-1 min-w-[220px]">
          <SearchInput placeholder="Buscar por paciente o RUT..." value={busqueda} onChange={setBusqueda} />
        </div>
        <div className="w-48">
          <SelectField etiqueta="Tipo de ficha" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos los tipos</option>
            {formatos.map((f) => (
              <option key={f.id} value={f.nombre}>
                {f.nombre}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="flex items-end gap-2">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-panel-sidebar">Desde</span>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="rounded-lg border border-brand-border bg-white px-3 py-2.5 text-sm text-panel-sidebar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-panel-sidebar">Hasta</span>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="rounded-lg border border-brand-border bg-white px-3 py-2.5 text-sm text-panel-sidebar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
            />
          </label>
        </div>
        <div className="ml-auto flex gap-3">
          <Button variante="secundario" onClick={() => router.push("/panel/fichas/formatos")}>
            Formatos de ficha
          </Button>
          <Button variante="primario" onClick={() => router.push("/panel/fichas/nueva/reserva")}>
            + Nueva ficha
          </Button>
        </div>
      </div>

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
          <FilaTabla key={ficha.id} onClick={() => router.push(`/panel/fichas/${ficha.id}`)}>
            <td className="px-4 py-3 font-medium text-panel-sidebar">
              {ficha.paciente.nombre} {ficha.paciente.apellido}
            </td>
            <td className="px-4 py-3 text-brand-muted">{ficha.paciente.rut}</td>
            <td className="px-4 py-3">
              <NeutralBadge>{ficha.tipo}</NeutralBadge>
            </td>
            <td className="px-4 py-3 text-brand-muted">{formatearFechaCorta(ficha.cita.fecha)}</td>
            <td className="px-4 py-3 text-brand-muted">
              {formatearFechaCorta(ficha.cita.fecha)} · {formatearRangoHorario(ficha.cita.horaInicio, ficha.cita.horaTermino)}
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
    </div>
  );
}
