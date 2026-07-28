import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import "../globals.css";
import { RelojPanelProvider } from "@/lib/panel/reloj";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <RelojPanelProvider>{children}</RelojPanelProvider>
      </body>
    </html>
  );
}
