"use client";

import {
  forwardRef,
  PointerEvent as ReactPointerEvent,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export interface SignaturePadHandle {
  exportarBase64: () => string | null;
  limpiar: () => void;
}

interface SignaturePadProps {
  onCambiar?: (vacio: boolean) => void;
}

const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  function SignaturePad({ onCambiar }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dibujando = useRef(false);
    const [vacio, setVacio] = useState(true);

    const contexto = () => canvasRef.current?.getContext("2d") ?? null;

    const posicion = (e: ReactPointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const escalaX = canvas.width / rect.width;
      const escalaY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * escalaX,
        y: (e.clientY - rect.top) * escalaY,
      };
    };

    const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
      const ctx = contexto();
      if (!ctx) return;
      dibujando.current = true;
      const { x, y } = posicion(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      canvasRef.current?.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!dibujando.current) return;
      const ctx = contexto();
      if (!ctx) return;
      const { x, y } = posicion(e);
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#0f172a";
      ctx.lineTo(x, y);
      ctx.stroke();
      if (vacio) {
        setVacio(false);
        onCambiar?.(false);
      }
    };

    const handlePointerUp = () => {
      dibujando.current = false;
    };

    useImperativeHandle(ref, () => ({
      exportarBase64: () => {
        if (vacio || !canvasRef.current) return null;
        return canvasRef.current.toDataURL("image/png");
      },
      limpiar: () => {
        const canvas = canvasRef.current;
        const ctx = contexto();
        if (canvas && ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        setVacio(true);
        onCambiar?.(true);
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        width={600}
        height={220}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full touch-none rounded-none border border-slate-300 bg-slate-50"
        style={{ height: 180 }}
      />
    );
  }
);

export default SignaturePad;
