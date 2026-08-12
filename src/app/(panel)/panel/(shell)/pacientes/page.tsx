"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useHoyPanel } from "@/lib/panel/reloj";
import { listPacientes, PacienteResuelto } from "@/lib/panel/data/pacientes";
import { Button } from "@/components/panel/primitives/Button";
import { SearchInput } from "@/components/panel/primitives/CamposFormulario";
import { NeutralBadge } from "@/components/panel/primitives/Badge";
import { EmptyState } from "@/components/panel/primitives/EmptyState";
import { Table, FilaTabla, CeldaChevron, Paginacion } from "@/components/panel/primitives/Table";
import { PacienteDetalleModal } from "@/components/panel/domain/PacienteDetalleModal";

const TAMANO_PAGINA = 8;

const COLUMNAS = [
  { titulo: "Nombre" },
  { titulo: "Apellido" },
  { titulo: "RUT" },
  { titulo: "Correo" },
  { titulo: "Teléfono", className: "whitespace-nowrap" },
  { titulo: "Convenio" },
];

function PacientesContenido() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hoy = useHoyPanel();

  const [busqueda, setBusqueda] = useState("");
  const [pacientes, setPacientes] = useState<PacienteResuelto[] | null>(null);
  const [pagina, setPagina] = useState(1);

  const pacienteModalId = searchParams.get("paciente");

  useEffect(() => {
    listPacientes(busqueda).then((resultado) => {
      setPacientes(resultado);
      setPagina(1);
    });
  }, [busqueda]);

  function abrirParametros(params: Record<string, string | undefined>) {
    const actuales = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([clave, valor]) => {
      if (valor === undefined) actuales.delete(clave);
      else actuales.set(clave, valor);
    });
    const query = actuales.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  if (pacientes === null || !hoy) {
    return <div aria-hidden />;
  }

  const total = pacientes.length;
  const inicio = (pagina - 1) * TAMANO_PAGINA;
  const visibles = pacientes.slice(inicio, inicio + TAMANO_PAGINA);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px]">
          <SearchInput
            placeholder="Buscar por RUT, nombre o correo..."
            value={busqueda}
            onChange={setBusqueda}
          />
        </div>
        <Button variante="primario" onClick={() => router.push("/panel/pacientes/nuevo")}>
          Nuevo paciente
        </Button>
      </div>

      <Table
        columnas={COLUMNAS}
        encabezado={<p className="font-bold text-panel-sidebar">{total} pacientes registrados</p>}
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
        {visibles.map((paciente) => (
          <FilaTabla key={paciente.id} onClick={() => abrirParametros({ paciente: paciente.id })}>
            <td className="px-4 py-3 font-medium text-panel-sidebar">
              {paciente.nombre}
              <span
                title={paciente.origenRegistro === "web" ? "Registrado desde la web" : "Registrado por el personal"}
                className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle"
                style={{ backgroundColor: paciente.origenRegistro === "web" ? "#0c5dc5" : "#94a3b8" }}
              />
            </td>
            <td className="px-4 py-3 text-panel-sidebar">{paciente.apellido}</td>
            <td className="px-4 py-3 text-brand-muted">{paciente.rut}</td>
            <td className="px-4 py-3 text-brand-muted">{paciente.correo}</td>
            <td className="px-4 py-3 text-brand-muted whitespace-nowrap">{paciente.telefono}</td>
            <td className="px-4 py-3">
              {paciente.convenio ? (
                <NeutralBadge>{paciente.convenio.nombre}</NeutralBadge>
              ) : (
                <span className="text-brand-muted">—</span>
              )}
            </td>
            <CeldaChevron />
          </FilaTabla>
        ))}
      </Table>

      {total === 0 && (
        <EmptyState
          titulo="Sin resultados"
          descripcion="Ningún paciente coincide con la búsqueda. Prueba con otro nombre, RUT o correo."
        />
      )}

      <PacienteDetalleModal
        pacienteId={pacienteModalId}
        hoy={hoy}
        onCerrar={() => abrirParametros({ paciente: undefined })}
      />
    </div>
  );
}

export default function PacientesPage() {
  return (
    <Suspense fallback={<div aria-hidden />}>
      <PacientesContenido />
    </Suspense>
  );
}
