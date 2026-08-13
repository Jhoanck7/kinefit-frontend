import { JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import "../globals.css";
import { RelojPanelProvider } from "@/lib/panel/reloj";

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
    <html
      lang="es"
      className={`${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400,300&display=swap"
        />
      </head>
      <body className="min-h-full font-sans">
        <RelojPanelProvider>{children}</RelojPanelProvider>
      </body>
    </html>
  );
}
