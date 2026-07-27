"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { transactionService } from '@/lib/services/transaction.service';
import { ConfirmarTransaccionResponseData } from '@/types';

function ConfirmarPagoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenWs = searchParams.get('token_ws') || searchParams.get('TBK_TOKEN');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConfirmarTransaccionResponseData | null>(null);

  useEffect(() => {
    async function confirmar() {
      if (!tokenWs) {
        setError('No se proporcionó el token de la transacción de Webpay.');
        setLoading(false);
        return;
      }

      try {
        const response = await transactionService.confirmarTransaccion(tokenWs);
        setResult(response.data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al confirmar la transacción de pago.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    confirmar();
  }, [tokenWs]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Validando Pago con Webpay...</h2>
          <p className="text-xs text-slate-500">Estamos confirmando el resultado de tu transacción de forma segura con Transbank.</p>
        </div>
      </div>
    );
  }

  if (error || (result && result.resultado === 'Rechazado')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xl animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 text-3xl mx-auto mb-4">
            ✕
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">Pago Rechazado o Incompleto</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            {error || 'La transacción de pago no pudo ser completada o fue cancelada en Webpay.'}
          </p>

          <button
            onClick={() => router.push('/')}
            className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl py-3.5 transition-colors uppercase tracking-wider cursor-pointer"
          >
            Volver a Intentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xl animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-500 text-3xl mx-auto mb-4">
          ✓
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-1">¡Reserva y Pago Confirmados!</h2>
        <p className="text-xs text-slate-500 mb-6">Tu cita ha sido agendada exitosamente en KineFit Chile.</p>

        {result && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left mb-6 flex flex-col gap-3 text-xs">
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-400 font-medium">Orden de Compra:</span>
              <span className="font-bold text-slate-800">{String(result.transaccion?.buyOrder || 'KF-CITA')}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-400 font-medium">Servicio:</span>
              <span className="font-semibold text-slate-900">{String(result.cita?.servicio || 'Kinesiología')}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-400 font-medium">Especialista:</span>
              <span className="font-semibold text-slate-900">{String(result.cita?.especialista || 'KineFit')}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-400 font-medium">Fecha y Hora:</span>
              <span className="font-semibold text-slate-900">{String(result.cita?.fecha || '')} {String(result.cita?.hora || '')} hrs</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-400 font-medium">Monto Pagado:</span>
              <span className="font-bold text-emerald-600">${Number(result.transaccion?.monto || 10000).toLocaleString('es-CL')} CLP</span>
            </div>
          </div>
        )}

        <button
          onClick={() => router.push('/')}
          className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl py-3.5 transition-colors uppercase tracking-wider cursor-pointer shadow-md"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
}

export default function ConfirmarPagoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConfirmarPagoContent />
    </Suspense>
  );
}
