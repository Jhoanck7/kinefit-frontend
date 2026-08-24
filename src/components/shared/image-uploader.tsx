"use client";

import Image from "next/image";
import React, { useRef, useState } from "react";

import {
  useDeleteImageMutation,
  useReplaceImageMutation,
  useUploadImageMutation,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";

import { Alerta } from "./alerta";

// El backend ya redimensiona y valida: esto solo acorta la subida de archivos grandes.
const UMBRAL_COMPRESION_BYTES = 8 * 1024 * 1024;
const LADO_MAYOR_MAXIMO = 2000;
const CALIDAD_JPEG = 0.95;

async function comprimirImagen(file: File): Promise<File> {
  if (file.type === "image/svg+xml" || file.size <= UMBRAL_COMPRESION_BYTES) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const escala = Math.min(
      1,
      LADO_MAYOR_MAXIMO / Math.max(bitmap.width, bitmap.height)
    );
    if (escala === 1) return file;

    const ancho = Math.round(bitmap.width * escala);
    const alto = Math.round(bitmap.height * escala);
    const canvas = document.createElement("canvas");
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, ancho, alto);

    const tipoSalida = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, tipoSalida, CALIDAD_JPEG)
    );
    if (!blob) return file;

    return new File([blob], file.name, { type: tipoSalida });
  } catch {
    return file;
  }
}

interface ImageUploaderProps {
  etiqueta?: string;
  value?: string;
  publicId?: string;
  onChange: (
    secureUrl: string,
    newPublicId?: string,
    width?: number,
    height?: number
  ) => void;
  folder?: string;
}

export function ImageUploader({
  etiqueta = "Imagen de la sección",
  value = "",
  publicId = "",
  onChange,
  folder = "kinefit",
}: ImageUploaderProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadImageMutation();
  const replaceMutation = useReplaceImageMutation();
  const deleteMutation = useDeleteImageMutation();
  const subiendo =
    uploadMutation.isPending ||
    replaceMutation.isPending ||
    deleteMutation.isPending;

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    await subirImagen(file);
  }

  async function subirImagen(file: File) {
    setErrorMsg(null);
    try {
      const archivo = await comprimirImagen(file);
      const resultado = publicId
        ? await replaceMutation.mutateAsync({ publicId, file: archivo, folder })
        : await uploadMutation.mutateAsync({ file: archivo, folder });
      onChange(
        resultado.url,
        resultado.publicId,
        resultado.ancho,
        resultado.alto
      );
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  }

  async function handleEliminar() {
    if (!value) return;
    setErrorMsg(null);
    try {
      if (publicId) {
        await deleteMutation.mutateAsync(publicId);
      }
      onChange("", "");
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  }

  return (
    <div className="space-y-2">
      {etiqueta && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
          {etiqueta}
        </label>
      )}

      {value ? (
        <div className="relative rounded-2xl border-2 border-slate-300 bg-white p-4 flex flex-col xl:flex-row items-center gap-4 overflow-hidden">
          <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 mx-auto xl:mx-0">
            <Image
              src={value}
              alt="Vista previa"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex-1 text-center xl:text-left space-y-2 w-full">
            <div className="flex flex-wrap justify-center xl:justify-start gap-2 pt-1 w-full">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={subiendo}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
              >
                {subiendo ? "Subiendo..." : "Cambiar Imagen"}
              </button>
              <button
                type="button"
                onClick={handleEliminar}
                disabled={subiendo}
                className="px-3 py-1.5 text-xs font-bold text-blue-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-brand-primary p-6 text-center transition-all flex flex-col items-center justify-center gap-2"
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-300 text-blue-600 flex items-center justify-center">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              {subiendo
                ? "Subiendo archivo a Cloudinary..."
                : "Haz clic o arrastra una imagen aquí"}
            </p>
            <p className="text-xs text-slate-500">
              Soporta PNG, JPG, WEBP o SVG (Máx 25 MB)
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {errorMsg && <Alerta tono="error">{errorMsg}</Alerta>}
    </div>
  );
}
