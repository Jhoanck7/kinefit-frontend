"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function WebpaySimulatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenWs = searchParams.get('token_ws') || 'tbk-demo-token-123';

  const [paymentMethod, setPaymentMethod] = useState<'debito' | 'credito'>('debito');
  const [cardNumber, setCardNumber] = useState('6623 **** **** 0001');
  const [isProcessing, setIsProcessing] = useState(false);

  // Derivar de forma pura la orden de compra a partir del token
  const buyOrder = `KF-${tokenWs.slice(-4).toUpperCase()}`;

  const handleApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      router.push(`/pago/confirmar?token_ws=${encodeURIComponent(tokenWs)}`);
    }, 1500);
  };

  const handleReject = () => {
    setIsProcessing(true);
    setTimeout(() => {
      router.push(`/pago/confirmar?token_ws=${encodeURIComponent(tokenWs)}&status=rejected`);
    }, 1000);
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl border border-slate-200">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-800 mb-1">Procesando pago con Transbank...</h3>
          <p className="text-xs text-slate-500">Conectando con tu banco emisor de forma segura.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col items-center py-10 px-4">
      {/* Transbank Header */}
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Banner Transbank */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white flex justify-between items-center">
          <div>
            <span className="text-xs tracking-widest font-black uppercase text-red-200">Pasarela Segura</span>
            <h1 className="text-2xl font-black tracking-tight">Webpay Plus</h1>
            <p className="text-[11px] text-red-100 font-medium">Transbank S.A. Chile</p>
          </div>
          <div className="bg-white text-red-600 rounded-xl px-4 py-2 text-xs font-extrabold uppercase shadow-sm">
            Entorno Pruebas
          </div>
        </div>

        {/* Resumen del Pedido */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Resumen de la Transacción</h2>
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Comercio:</span>
              <span className="font-bold text-slate-900">KineFit Chile SpA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Orden de Compra:</span>
              <span className="font-semibold text-slate-700">{buyOrder}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-100">
              <span className="text-slate-500 font-semibold">Monto Total:</span>
              <span className="text-base font-extrabold text-red-600">$10.000 CLP</span>
            </div>
          </div>
        </div>

        {/* Selección de Medio de Pago */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">1. Selecciona Medio de Pago</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('debito')}
                className={`p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left flex items-center justify-between ${
                  paymentMethod === 'debito'
                    ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-600/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <span>Redcompra / Débito</span>
                {paymentMethod === 'debito' && <span>✓</span>}
              </button>

              <button
                onClick={() => setPaymentMethod('credito')}
                className={`p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left flex items-center justify-between ${
                  paymentMethod === 'credito'
                    ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-600/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <span>Tarjeta de Crédito</span>
                {paymentMethod === 'credito' && <span>✓</span>}
              </button>
            </div>
          </div>

          {/* Datos de la Tarjeta Simulado */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase">2. Datos de la Tarjeta (Prueba)</h4>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Número de Tarjeta de Pruebas</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 font-mono font-bold"
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleApprove}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-red-600/20 cursor-pointer"
            >
              Pagar $10.000 con Transbank
            </button>

            <button
              onClick={handleReject}
              className="w-full bg-white hover:bg-slate-100 text-slate-500 font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors border border-slate-200 cursor-pointer"
            >
              Simular Pago Rechazado / Cancelar
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 text-center border-t border-slate-200">
          <p className="text-[10px] text-slate-400">
            Transacción 100% cifrada bajo estándar PCI-DSS de Transbank S.A.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WebpaySimulatorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <WebpaySimulatorContent />
    </Suspense>
  );
}
