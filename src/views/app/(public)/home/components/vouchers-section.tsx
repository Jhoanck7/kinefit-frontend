"use client";

import { Info } from "lucide-react";
import Image from "next/image";
import React, { useRef } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LandingConfigResponse, VoucherItem } from "@/models/responses";

export default function VouchersSection({
  config,
}: {
  config: LandingConfigResponse;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  let vouchers: VoucherItem[] = [];
  if (config.vouchersJson) {
    try {
      const parsed = JSON.parse(config.vouchersJson);
      if (Array.isArray(parsed)) vouchers = parsed;
    } catch {}
  }

  if (vouchers.length === 0) return null;

  const mostrarNota =
    config.vouchersMostrarNota !== false &&
    Boolean(config.vouchersNota?.trim());

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      const amount = direction === "left" ? -width : width;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <section
      id="vouchers"
      className="scroll-mt-24 py-24 bg-white border-b border-slate-200/60 text-slate-900"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7 relative group">
            <div
              ref={scrollRef}
              className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {vouchers.map((voucher, idx) => (
                <div
                  key={`${voucher.imagenSofa}-${idx}`}
                  className="w-full shrink-0 snap-start snap-always relative flex justify-center"
                >
                  <div className="rounded-global overflow-hidden">
                    <Image
                      src={voucher.imagenBlanco}
                      alt={voucher.alt}
                      width={voucher.anchoBlanco}
                      height={voucher.altoBlanco}
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="w-auto h-auto max-w-full max-h-[85vh] object-contain mx-auto"
                    />
                  </div>
                  {voucher.imagenSofa && (
                    <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 w-24 sm:w-32 md:w-40 rotate-3 rounded-global overflow-hidden border-4 border-white shadow-lg">
                      <Image
                        src={voucher.imagenSofa}
                        alt={voucher.alt}
                        width={voucher.anchoSofa}
                        height={voucher.altoSofa}
                        sizes="160px"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {vouchers.length > 1 && (
              <>
                <button
                  onClick={() => scroll("left")}
                  className="absolute left-[-16px] xl:left-[-24px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:text-brand-primary hover:border-brand-primary/30 transition-all duration-300 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 active:scale-95"
                  aria-label="Anterior"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="absolute right-[-16px] xl:right-[-24px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:text-brand-primary hover:border-brand-primary/30 transition-all duration-300 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 active:scale-95"
                  aria-label="Siguiente"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>

          <div className="lg:col-span-5 text-left">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-3">
              Vouchers de Regalo
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              {config.vouchersTitle || "Regala Bienestar"}
            </p>
            {config.vouchersSubtitle && (
              <p className="text-slate-500 text-base sm:text-lg whitespace-pre-line">
                {config.vouchersSubtitle}
              </p>
            )}
            {mostrarNota && (
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-brand-primary transition-colors cursor-pointer"
                  >
                    <Info className="w-4 h-4" />
                    Nota importante
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="sr-only">
                      Nota importante
                    </DialogTitle>
                    <DialogDescription className="whitespace-pre-line">
                      {config.vouchersNota}
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
