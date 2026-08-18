import "../globals.css";

import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import { Toaster } from "@/components/ui";
import { ReactQueryProvider, RelojPanelProvider } from "@/providers";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
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
    <html lang="es" className={`${jetbrainsMono.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400,300&display=swap"
        />
      </head>
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
