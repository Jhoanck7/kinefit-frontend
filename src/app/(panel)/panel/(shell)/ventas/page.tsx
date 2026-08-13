"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VENTAS_MOCK, VentaMock, MetodoPago, TERMINALES_MOCK } from "@/lib/mock/ventas";
import { Table, FilaTabla, CeldaChevron, Paginacion } from "@/components/panel/primitives/Table";
import { VentasFiltrosBar } from "@/components/panel/ventas/VentasFiltrosBar";
import { VentaDetalleModal } from "@/components/panel/ventas/VentaDetalleModal";
import { NuevaVentaModal } from "@/components/panel/ventas/NuevaVentaModal";
import { ConfiguracionFinancieraModal } from "@/components/panel/ventas/ConfiguracionFinancieraModal";

const TAMANO_PAGINA = 8;

const COLUMNAS = [
  { titulo: "ID / Venta" },
  { titulo: "Fecha" },
  { titulo: "Cliente" },
  { titulo: "Servicio" },
  { titulo: "Monto Bruto", className: "whitespace-nowrap" },
  { titulo: "Método Pago" },
  { titulo: "Terminal POS" },
  { titulo: "Comisión POS" },
  { titulo: "IVA" },
  { titulo: "Monto Neto" },
  { titulo: "Pago Prof." },
  { titulo: "Margen Clínica" },
];

export default function PlanillaVentasPage() {
  const router = useRouter();
  const [ventas, setVentas] = useState<VentaMock[]>(VENTAS_MOCK);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaMock | null>(null);
  const [pagina, setPagina] = useState(1);

  // Modales
  const [modalNuevaVenta, setModalNuevaVenta] = useState(false);
  const [modalConfig, setModalConfig] = useState(false);

  // Filtros
  const [rangoFecha, setRangoFecha] = useState("30dias");
  const [metodoPago, setMetodoPago] = useState("todos");
  const [busquedaPaciente, setBusquedaPaciente] = useState("");

  const ventasFiltradas = ventas.filter((v) => {
    if (metodoPago !== "todos" && v.metodoPago !== metodoPago) return false;
    if (
      busquedaPaciente.trim() !== "" &&
      !v.pacienteNombre.toLowerCase().includes(busquedaPaciente.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const total = ventasFiltradas.length;
  const inicio = (pagina - 1) * TAMANO_PAGINA;
  const visibles = ventasFiltradas.slice(inicio, inicio + TAMANO_PAGINA);

  function handleActualizarVenta(id: string, cambios: Partial<VentaMock>) {
    setVentas((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;

        const updated = { ...v, ...cambios };
        const termObj = TERMINALES_MOCK.find((t) => t.id === updated.terminalPosId);
        const requiereTerminal = updated.metodoPago === "Debito" || updated.metodoPago === "Credito";
        const pctPos = requiereTerminal && termObj ? termObj.comisionPorcentaje : 0;
        updated.comisionPosMonto = Math.round(updated.montoBruto * (pctPos / 100));

        const primerItem = updated.items[0];
        const esAfecto = primerItem ? primerItem.afectoIva : true;
        updated.ivaMonto = esAfecto ? Math.round(updated.montoBruto - updated.montoBruto / 1.19) : 0;
        updated.montoNeto = updated.montoBruto - updated.ivaMonto;
        updated.baseReparticion = updated.montoNeto - updated.comisionPosMonto;

        if (updated.repartoConfigurado && updated.porcentajeProfesionalAplicado !== undefined) {
          updated.pagoProfesional = Math.round(
            updated.baseReparticion * (updated.porcentajeProfesionalAplicado / 100)
          );
          updated.margenClinica = updated.baseReparticion - updated.pagoProfesional;
        }

        return updated;
      })
    );
  }

  function handleExportar() {
    alert("Exportando Planilla de Ventas a formato Excel / CSV...");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 font-sans shadow-none">
      {/* Barra de Filtros */}
      <VentasFiltrosBar
        rangoFecha={rangoFecha}
        setRangoFecha={setRangoFecha}
        metodoPago={metodoPago}
        setMetodoPago={setMetodoPago}
        busquedaPaciente={busquedaPaciente}
        setBusquedaPaciente={setBusquedaPaciente}
        onAbrirNuevaVenta={() => setModalNuevaVenta(true)}
        onAbrirConfiguracion={() => setModalConfig(true)}
        onExportar={handleExportar}
      />

      {/* Tabla Principal de Ventas */}
      <Table
        columnas={COLUMNAS}
        encabezado={<p className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">{total} ventas registradas</p>}
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
        {visibles.map((venta) => {
          const primerItem = venta.items[0];
          return (
            <FilaTabla key={venta.id} onClick={() => setVentaSeleccionada(venta)}>
              <td className="px-4 py-3 font-sans font-medium text-sm text-slate-900">
                {venta.codigoDisplay}
              </td>
              <td className="px-4 py-3 font-sans font-medium text-sm text-slate-700">{venta.fechaFormateada}</td>
              <td className="px-4 py-3 font-sans font-medium text-sm text-slate-700">{venta.pacienteNombre}</td>
              <td className="px-4 py-3 font-sans font-medium text-sm text-slate-700">{primerItem?.servicioNombre ?? "Atención"}</td>
              <td className="px-4 py-3 font-sans font-medium text-sm text-slate-900 whitespace-nowrap">
                ${venta.montoBruto.toLocaleString("es-CL")}
              </td>
              <td className="px-4 py-3 font-sans font-medium text-sm text-slate-700">{venta.metodoPago}</td>
              <td className="px-4 py-3 font-sans font-medium text-sm text-slate-700">{venta.terminalNombre ?? "—"}</td>
              <td className="px-4 py-3 font-sans font-medium text-sm text-slate-700">
                {venta.comisionPosMonto > 0 ? `-$${venta.comisionPosMonto.toLocaleString("es-CL")}` : "$0"}
              </td>
              <td className="px-4 py-3 font-sans font-medium text-sm text-slate-700">${venta.ivaMonto.toLocaleString("es-CL")}</td>
              <td className="px-4 py-3 font-sans font-medium text-sm text-slate-700">${venta.montoNeto.toLocaleString("es-CL")}</td>
              <td className="px-4 py-3 font-sans font-medium text-sm text-slate-700">
                {venta.pagoProfesional ? `$${venta.pagoProfesional.toLocaleString("es-CL")}` : "—"}
              </td>
              <td className="px-4 py-3 font-sans font-medium text-sm text-slate-700">
                {venta.margenClinica ? `$${venta.margenClinica.toLocaleString("es-CL")}` : "—"}
              </td>
              <CeldaChevron />
            </FilaTabla>
          );
        })}
      </Table>

      {/* Modales */}
      <VentaDetalleModal venta={ventaSeleccionada} onClose={() => setVentaSeleccionada(null)} />
      <NuevaVentaModal
        abierto={modalNuevaVenta}
        onClose={() => setModalNuevaVenta(false)}
        onCrearVenta={(nueva) => setVentas([nueva, ...ventas])}
      />
      <ConfiguracionFinancieraModal abierto={modalConfig} onClose={() => setModalConfig(false)} />
    </div>
  );
}
