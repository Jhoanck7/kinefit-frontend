"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import React from "react";

export interface AdminPanelButtonProps {
  className?: string;
  variant?: "navbar" | "drawer" | "floating";
}

export function AdminPanelButton({
  className = "",
  variant = "navbar",
}: AdminPanelButtonProps) {
  const [mounted, setMounted] = React.useState(false);
  const sessionResult = useSession();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const session = sessionResult?.data;
  const status = sessionResult?.status;

  if (status === "loading" || session?.user?.rol !== "Administrador") {
    return null;
  }

  if (variant === "drawer") {
    return (
      <Link
        href="/panel/agenda"
        className={`flex items-center justify-between w-full bg-[#003366] hover:bg-[#002244] text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm mt-2 ${className}`}
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          <span>Panel Administrador</span>
        </span>
        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-semibold">
          ADMIN
        </span>
      </Link>
    );
  }

  if (variant === "floating") {
    return (
      <Link
        href="/panel/agenda"
        className={`fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#003366] hover:bg-[#002244] text-white px-4 py-3 rounded-full font-bold text-xs shadow-xl tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 uppercase ${className}`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
        <span>Panel Admin</span>
      </Link>
    );
  }

  return (
    <Link
      href="/panel/agenda"
      className={`inline-flex items-center gap-1.5 bg-[#003366] hover:bg-[#002244] text-white px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 border border-[#002244] ${className}`}
      title="Ir al Panel de Administración"
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
      <span>Panel Admin</span>
    </Link>
  );
}
