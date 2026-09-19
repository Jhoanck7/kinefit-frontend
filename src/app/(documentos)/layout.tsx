import "../globals.css";

import type { Metadata } from "next";
import { JetBrains_Mono, Roboto } from "next/font/google";

import { Toaster } from "@/components/ui";
import { ReactQueryProvider } from "@/providers";

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
  title: "Firma de documento | KineFit",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DocumentosRootLayout({
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
      <body className="min-h-full font-sans bg-white">
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
