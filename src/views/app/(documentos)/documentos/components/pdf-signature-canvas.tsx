"use client";

import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PdfSignatureCanvasHandle {
    generarDocumentoFirmadoBase64: () => Promise<string | null>;
    limpiar: () => void;
    estaVacia: () => boolean;
}

interface PdfSignatureCanvasProps {
    url: string;
    onCambiar?: (vacia: boolean) => void;
}

interface PaginaInfo {
    indice: number;
    ancho: number;
    alto: number;
}

const PdfSignatureCanvas = forwardRef<
    PdfSignatureCanvasHandle,
    PdfSignatureCanvasProps
>(function PdfSignatureCanvas({ url, onCambiar }, ref) {
    const [paginas, setPaginas] = useState<PaginaInfo[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandido, setExpandido] = useState(false);
    const bytesOriginalesRef = useRef<ArrayBuffer | null>(null);
    const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
    const pdfCanvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
    const firmaCanvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
    const dibujandoRef = useRef(false);
    const paginasConTrazoRef = useRef<Set<number>>(new Set());

    useEffect(() => {
        let cancelado = false;

        async function cargar() {
            setCargando(true);
            setError(null);
            try {
                const respuesta = await fetch(url);
                if (!respuesta.ok) throw new Error("No se pudo descargar el documento");
                const bytes = await respuesta.arrayBuffer();
                bytesOriginalesRef.current = bytes;

                const pdf = await pdfjsLib.getDocument({ data: bytes.slice(0) })
                    .promise;
                if (cancelado) return;
                pdfDocRef.current = pdf;

                const escalaBase = 1.5;
                const info: PaginaInfo[] = [];
                for (let i = 0; i < pdf.numPages; i++) {
                    const pagina = await pdf.getPage(i + 1);
                    const viewport = pagina.getViewport({ scale: escalaBase });
                    info.push({
                        indice: i,
                        ancho: viewport.width,
                        alto: viewport.height,
                    });
                }
                if (cancelado) return;
                setPaginas(info);
                setCargando(false);
            } catch (err) {
                if (!cancelado) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "No se pudo mostrar el documento"
                    );
                    setCargando(false);
                }
            }
        }

        cargar();
        return () => {
            cancelado = true;
        };
    }, [url]);

    // recién acá los <canvas> ya existen en el DOM: React garantiza que useEffect corre después del commit
    useEffect(() => {
        if (paginas.length === 0 || !pdfDocRef.current) return;
        let cancelado = false;

        async function dibujar() {
            try {
                for (const pagina of paginas) {
                    if (cancelado) return;
                    const paginaPdf = await pdfDocRef.current!.getPage(pagina.indice + 1);
                    const viewport = paginaPdf.getViewport({ scale: 1.5 });
                    const canvas = pdfCanvasRefs.current[pagina.indice];
                    const contexto = canvas?.getContext("2d");
                    if (!canvas || !contexto) continue;
                    await paginaPdf.render({ canvas, canvasContext: contexto, viewport }).promise;
                }
            } catch (err) {
                if (!cancelado) {
                    setError(
                        err instanceof Error ? err.message : "No se pudo dibujar el documento"
                    );
                }
            }
        }

        dibujar();
        return () => {
            cancelado = true;
        };
    }, [paginas]);

    function posicionDesdeEvento(
        canvas: HTMLCanvasElement,
        e: React.PointerEvent<HTMLCanvasElement>
    ) {
        const rect = canvas.getBoundingClientRect();
        const escalaX = canvas.width / rect.width;
        const escalaY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * escalaX,
            y: (e.clientY - rect.top) * escalaY,
        };
    }

    function avisarCambio() {
        onCambiar?.(paginasConTrazoRef.current.size === 0);
    }

    function handlePointerDown(
        indice: number,
        e: React.PointerEvent<HTMLCanvasElement>
    ) {
        const canvas = firmaCanvasRefs.current[indice];
        if (!canvas) return;
        canvas.setPointerCapture(e.pointerId);
        dibujandoRef.current = true;
        const contexto = canvas.getContext("2d");
        const { x, y } = posicionDesdeEvento(canvas, e);
        contexto?.beginPath();
        contexto?.moveTo(x, y);
    }

    function handlePointerMove(
        indice: number,
        e: React.PointerEvent<HTMLCanvasElement>
    ) {
        if (!dibujandoRef.current) return;
        const canvas = firmaCanvasRefs.current[indice];
        if (!canvas) return;
        const contexto = canvas.getContext("2d");
        if (!contexto) return;
        const { x, y } = posicionDesdeEvento(canvas, e);
        contexto.lineWidth = 2.5;
        contexto.lineCap = "round";
        contexto.strokeStyle = "#0f172a";
        contexto.lineTo(x, y);
        contexto.stroke();

        if (!paginasConTrazoRef.current.has(indice)) {
            paginasConTrazoRef.current.add(indice);
            avisarCambio();
        }
    }

    function handlePointerUp(
        indice: number,
        e: React.PointerEvent<HTMLCanvasElement>
    ) {
        dibujandoRef.current = false;
        firmaCanvasRefs.current[indice]?.releasePointerCapture(e.pointerId);
    }

    function limpiar() {
        firmaCanvasRefs.current.forEach(canvas => {
            const contexto = canvas?.getContext("2d");
            if (canvas && contexto)
                contexto.clearRect(0, 0, canvas.width, canvas.height);
        });
        paginasConTrazoRef.current.clear();
        avisarCambio();
    }

    async function generarDocumentoFirmadoBase64(): Promise<string | null> {
        if (paginasConTrazoRef.current.size === 0 || !bytesOriginalesRef.current)
            return null;

        const pdfDoc = await PDFDocument.load(bytesOriginalesRef.current.slice(0));

        for (const indice of paginasConTrazoRef.current) {
            const canvas = firmaCanvasRefs.current[indice];
            if (!canvas) continue;
            const pngBytes = await fetch(canvas.toDataURL("image/png")).then(r =>
                r.arrayBuffer()
            );
            const pngImage = await pdfDoc.embedPng(pngBytes);
            const pagina = pdfDoc.getPage(indice);
            const { width, height } = pagina.getSize();
            pagina.drawImage(pngImage, { x: 0, y: 0, width, height });
        }

        const pdfBytesFinal = await pdfDoc.save();

        // conversión por bloques para no reventar el call stack en PDFs grandes
        let binario = "";
        const tamanoBloque = 0x8000;
        for (let i = 0; i < pdfBytesFinal.length; i += tamanoBloque) {
            binario += String.fromCharCode(
                ...pdfBytesFinal.subarray(i, i + tamanoBloque)
            );
        }
        return `data:application/pdf;base64,${btoa(binario)}`;
    }

    useImperativeHandle(ref, () => ({
        generarDocumentoFirmadoBase64,
        limpiar,
        estaVacia: () => paginasConTrazoRef.current.size === 0,
    }));

    if (error) {
        return (
            <div className="border border-rose-300 bg-rose-50 p-4 text-xs text-rose-700">
                {error}
            </div>
        );
    }

    return (
        <div
            className={
                expandido
                    ? "fixed inset-0 z-50 flex flex-col bg-slate-900"
                    : "border border-border"
            }
        >
            <button
                type="button"
                onClick={() => setExpandido(v => !v)}
                className={
                    expandido
                        ? "shrink-0 bg-slate-900 py-3 text-xs font-bold uppercase tracking-widest text-white"
                        : "w-full border-b border-border bg-slate-50 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-500"
                }
            >
                {expandido ? "Cerrar pantalla completa" : "Ver en pantalla completa"}
            </button>

            {cargando && (
                <div className="flex h-[70vh] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
                </div>
            )}
            {!cargando && (
                <div
                    className="flex-1 space-y-3 overflow-y-auto bg-slate-100 p-2 sm:p-3"
                    style={{
                        height: expandido ? undefined : "70vh",
                        touchAction: "none",
                    }}
                >
                    {paginas.map(pagina => (
                        <div
                            key={pagina.indice}
                            className="relative mx-auto w-full bg-white shadow-sm"
                            style={{ aspectRatio: `${pagina.ancho} / ${pagina.alto}` }}
                        >
                            <canvas
                                ref={el => {
                                    pdfCanvasRefs.current[pagina.indice] = el;
                                }}
                                width={pagina.ancho}
                                height={pagina.alto}
                                className="block h-full w-full"
                            />
                            <canvas
                                ref={el => {
                                    firmaCanvasRefs.current[pagina.indice] = el;
                                }}
                                width={pagina.ancho}
                                height={pagina.alto}
                                className="absolute left-0 top-0 h-full w-full cursor-crosshair touch-none"
                                onPointerDown={e => handlePointerDown(pagina.indice, e)}
                                onPointerMove={e => handlePointerMove(pagina.indice, e)}
                                onPointerUp={e => handlePointerUp(pagina.indice, e)}
                                onPointerLeave={e => handlePointerUp(pagina.indice, e)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

export default PdfSignatureCanvas;
