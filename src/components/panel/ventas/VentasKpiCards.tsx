"use client";

import { Card } from "@/components/panel/primitives/Card";
import { VentaMock } from "@/lib/mock/ventas";

interface VentasKpiCardsProps {
  ventas: VentaMock[];
}

export function VentasKpiCards({ ventas }: VentasKpiCardsProps) {
  const totalVentasBrutas = ventas.reduce((acc, v) => acc + v.montoBruto, 0);
  const totalTransacciones = ventas.length;

  const totalComisionesPos = ventas.reduce(
    (acc, v) => acc + v.comisionPosMonto,
    0
  );

  // Ventas por POS
  const ventasTuu = ventas
    .filter(v => v.terminalNombre?.includes("Tuu"))
    .reduce((acc, v) => acc + v.montoBruto, 0);
  const ventasAgendaPro = ventas
    .filter(v => v.terminalNombre?.includes("AgendaPro"))
    .reduce((acc, v) => acc + v.montoBruto, 0);
  const ventasMercadoPago = ventas
    .filter(v => v.terminalNombre?.includes("Mercado"))
    .reduce((acc, v) => acc + v.montoBruto, 0);

  // Ventas afectas vs exentas
  let totalAfecto = 0;
  let totalExento = 0;

  ventas.forEach(v => {
    v.items.forEach(item => {
      if (item.afectoIva) {
        totalAfecto += item.monto;
      } else {
        totalExento += item.monto;
      }
    });
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm text-panel-sidebar">
      {/* Card 1: Total Ventas Brutas */}
      <Card>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-brand-muted text-sm uppercase tracking-wider">
            Total Ventas Brutas
          </span>
          <span className="rounded-full bg-panel-seleccion px-2.5 py-1 text-sm font-semibold text-panel-sidebar">
            {totalTransacciones} txs
          </span>
        </div>
        <p className="mt-3 text-xl font-bold text-panel-sidebar">
          ${totalVentasBrutas.toLocaleString("es-CL")}{" "}
          <span className="text-sm font-normal text-brand-muted">CLP</span>
        </p>
        <p className="mt-1 text-sm text-brand-muted">
          Ingreso bruto cobrado a clientes
        </p>
      </Card>

      {/* Card 2: Ventas por Máquina POS */}
      <Card>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-brand-muted text-sm uppercase tracking-wider">
            Ventas por Máquina POS
          </span>
          <span className="text-sm font-semibold text-emerald-700">
            En línea
          </span>
        </div>
        <div className="mt-3 space-y-1 text-sm text-panel-sidebar">
          <div className="flex justify-between">
            <span className="font-medium text-brand-muted">Tuu POS:</span>
            <span className="font-bold text-panel-sidebar">
              ${ventasTuu.toLocaleString("es-CL")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-brand-muted">AgendaPro:</span>
            <span className="font-bold text-panel-sidebar">
              ${ventasAgendaPro.toLocaleString("es-CL")}
            </span>
          </div>
          {ventasMercadoPago > 0 && (
            <div className="flex justify-between">
              <span className="font-medium text-brand-muted">
                Mercado Pago:
              </span>
              <span className="font-bold text-panel-sidebar">
                ${ventasMercadoPago.toLocaleString("es-CL")}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Card 3: Comisiones de Terminales */}
      <Card>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-brand-muted text-sm uppercase tracking-wider">
            Comisiones POS
          </span>
          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-sm font-semibold text-rose-700">
            Descuentos POS
          </span>
        </div>
        <p className="mt-3 text-xl font-bold text-rose-700">
          -${totalComisionesPos.toLocaleString("es-CL")}{" "}
          <span className="text-sm font-normal text-brand-muted">CLP</span>
        </p>
        <p className="mt-1 text-sm text-brand-muted">
          Costo total por operaciones de tarjeta
        </p>
      </Card>

      {/* Card 4: Ventas Afectas / Exentas */}
      <Card>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-brand-muted text-sm uppercase tracking-wider">
            Tributación IVA
          </span>
          <span className="text-sm font-semibold text-panel-sidebar">
            19% / 0%
          </span>
        </div>
        <div className="mt-3 space-y-1.5 text-sm text-panel-sidebar">
          <div className="flex justify-between">
            <span className="text-brand-muted">Afectas IVA (19%):</span>
            <span className="font-bold text-panel-sidebar">
              ${totalAfecto.toLocaleString("es-CL")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-muted">Exentas (0%):</span>
            <span className="font-bold text-panel-sidebar">
              ${totalExento.toLocaleString("es-CL")}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
