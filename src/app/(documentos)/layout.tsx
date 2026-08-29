import "../globals.css";

import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";

import { Toaster } from "@/components/ui";
import { ReactQueryProvider } from "@/providers";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
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
      className={`${jetbrainsMono.variable} h-full antialiased`}
      style={
        {
          "--font-sans":
            '"Satoshi", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        } as React.CSSProperties
      }
    >
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400,300&display=swap"
        />
      </head>
      <body className="min-h-full font-sans bg-white">
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
