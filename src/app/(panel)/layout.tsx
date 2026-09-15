import "../globals.css";

import type { Metadata } from "next";
import { JetBrains_Mono, Roboto } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import { Toaster } from "@/components/ui";
import { ReactQueryProvider, RelojPanelProvider } from "@/providers";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Panel Administrativo | Kinefit",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PanelRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${jetbrainsMono.variable} ${roboto.variable} h-full antialiased`}
      style={
        {
          "--font-sans":
            'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        } as React.CSSProperties
      }
    >
      <body className="min-h-full font-sans">
        <SessionProvider>
          <ReactQueryProvider>
            <RelojPanelProvider>{children}</RelojPanelProvider>
          </ReactQueryProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
