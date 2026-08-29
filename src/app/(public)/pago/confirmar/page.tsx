"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

import { useGetDocumentosPendientes } from "@/hooks/api";
import { transaccionService } from "@/services";
import { ConfirmarTransaccionResponseData } from "@/types";

function ConfirmarPagoContent() {
  const searchParams = useSearchParams();
  const tokenWs = searchParams.get("token_ws");
  const tbkToken = searchParams.get("TBK_TOKEN");
  const tbkOrdenCompra = searchParams.get("TBK_ORDEN_COMPRA");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConfirmarTransaccionResponseData | null>(
    null
  );

  const { data: documentosPendientes } = useGetDocumentosPendientes(
    result?.citaId ?? null
  );

  useEffect(() => {
    async function confirmar() {
      // TBK_TOKEN/TBK_ORDEN_COMPRA sin token_ws = el paciente abandonó en Webpay
      if (tbkToken || (tbkOrdenCompra && !tokenWs)) {
        setError(
          "El pago fue cancelado por el usuario en Webpay o la sesión fue anulada."
        );
        setLoading(false);
        return;
      }

      if (!tokenWs) {
        setError("No se proporcionó el token de la transacción de Webpay.");
        setLoading(false);
        return;
      }

      try {
        const response = await transaccionService.confirmarTransaccion(tokenWs);
        setResult(response.data.data);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Error al confirmar la transacción de pago con el servidor.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    confirmar();
  }, [tokenWs, tbkToken, tbkOrdenCompra]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Validando Pago con Webpay...
          </h2>
          <p className="text-xs text-slate-500">
            Estamos confirmando el resultado de tu transacción de forma segura
            con Transbank.
          </p>
        </div>
      </div>
    );
  }

  // caso crítico: Webpay cobró pero la reserva no quedó confirmada
  if (!error && result?.advertencia) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xl animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 text-3xl mx-auto mb-4">
            !
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">
            Tu pago se procesó, pero la reserva no se pudo confirmar
          </h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            {result.advertencia}
          </p>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left mb-6 flex flex-col gap-2 text-xs">
            <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span className="text-slate-400">Orden de Compra:</span>
              <span className="font-semibold text-slate-700">
                {result.buyOrder || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Monto:</span>
              <span className="font-semibold text-slate-700">
                ${result.monto.toLocaleString("es-CL")} CLP
              </span>
            </div>
          </div>

          <Link
            href="/"
            className="block w-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl py-3.5 transition-colors uppercase tracking-wider text-center shadow-md"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  const esAprobado = Boolean(
    !error &&
    result &&
    result.estado === "Aprobado" &&
    result.estadoCita === "Confirmada"
  );

  if (!esAprobado) {
    let mensajeError =
      error ||
      "La transacción de pago no pudo ser completada o fue rechazada por el banco.";
    if (result) {
      if (result.estado === "Rechazado") {
        mensajeError =
          "El pago fue rechazado por Webpay o el emisor de tu tarjeta bancaria. Los fondos no fueron cobrados.";
      } else if (result.estado === "Expirado") {
        mensajeError =
          "El tiempo límite para realizar el pago en Webpay expiró. Tu reserva no fue confirmada.";
      }
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xl animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 text-3xl mx-auto mb-4 font-bold">
            ✕
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">
            Pago Rechazado o Cancelado
          </h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            {mensajeError}
          </p>

          {result && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left mb-6 flex flex-col gap-2 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-400">Orden de Compra:</span>
                <span className="font-semibold text-slate-700">
                  {result.buyOrder || "—"}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-400">Estado Transacción:</span>
                <span className="font-bold text-rose-600">
                  {result.estado || "Rechazado"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estado de Cita:</span>
                <span className="font-bold text-slate-700">
                  {result.estadoCita || "Cancelada"}
                </span>
              </div>
            </div>
          )}

          <Link
            href="/"
            className="block w-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl py-3.5 transition-colors uppercase tracking-wider text-center"
          >
            Volver a Intentar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xl animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-500 text-3xl mx-auto mb-4 font-bold">
          ✓
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
          ¡Reserva y Pago Confirmados!
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Tu cita ha sido agendada exitosamente en KineFit Chile.
        </p>

        {result && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left mb-6 flex flex-col gap-3 text-xs">
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-400 font-medium">
                N° de Reserva / Cita:
              </span>
              <span className="font-bold text-slate-900">#{result.citaId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-400 font-medium">
                Orden de Compra:
              </span>
              <span className="font-bold text-slate-800">
                {result.buyOrder}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-400 font-medium">
                Estado del Pago:
              </span>
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Aprobado
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-400 font-medium">
                Estado de la reserva:
              </span>
              <span className="font-semibold text-slate-900">
                {result.estadoCita}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-400 font-medium">Monto Pagado:</span>
              <span className="font-bold text-emerald-600">
                ${result.monto.toLocaleString("es-CL")} CLP
              </span>
            </div>
          </div>
        )}

        {documentosPendientes && documentosPendientes.length > 0 && (
          <Link
            href={`/documentos/propio/${documentosPendientes[0].id}`}
            className="block w-full mb-3 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl py-3.5 transition-colors uppercase tracking-wider text-center shadow-md"
          >
            Firmar ahora
          </Link>
        )}

        <Link
          href="/"
          className={
            documentosPendientes && documentosPendientes.length > 0
              ? "block w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl py-3.5 transition-colors uppercase tracking-wider text-center"
              : "block w-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl py-3.5 transition-colors uppercase tracking-wider text-center shadow-md"
          }
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmarPagoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ConfirmarPagoContent />
    </Suspense>
  );
}
