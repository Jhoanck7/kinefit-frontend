"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Reusa la paleta sólida de `components/shared/alerta.tsx` (fondo sólido,
 * texto blanco, sin borde) en vez del tema claro+borde por defecto de sonner.
 * Sin next-themes: el panel no tiene modo oscuro, así que theme="light" fijo.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "#0f172a",
          "--normal-text": "#ffffff",
          "--normal-border": "transparent",
          "--success-bg": "#047857",
          "--success-text": "#ffffff",
          "--success-border": "transparent",
          "--error-bg": "#b91c1c",
          "--error-text": "#ffffff",
          "--error-border": "transparent",
          "--warning-bg": "#d97706",
          "--warning-text": "#ffffff",
          "--warning-border": "transparent",
          "--info-bg": "#1e40af",
          "--info-text": "#ffffff",
          "--info-border": "transparent",
          "--border-radius": "0px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast font-sans text-xs font-semibold shadow-none",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
