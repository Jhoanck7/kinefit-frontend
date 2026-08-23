import "../globals.css";

import { Geist, JetBrains_Mono } from "next/font/google";

import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import { WhatsAppButton } from "@/components/shared";
import { CLINIC_INFO, defaultMetadata } from "@/lib/utils";
import { ReactQueryProvider } from "@/providers";
import { landingConfigService } from "@/services";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = defaultMetadata;
export const revalidate = 60;

function extraerRangoHoras(
  texto: string,
  fallback: { opens: string; closes: string }
): { opens: string; closes: string } {
  const match = texto.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  return match ? { opens: match[1], closes: match[2] } : fallback;
}

function extraerDireccion(texto: string): {
  streetAddress: string;
  addressLocality: string;
} {
  const partes = texto.split(",").map(p => p.trim());
  if (partes.length >= 2) {
    return {
      streetAddress: partes[0],
      addressLocality: partes[partes.length - 1],
    };
  }
  return {
    streetAddress: "Pje. Maximiliano Poblete 596",
    addressLocality: "Antofagasta",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const configRes = await landingConfigService.getConfig().catch(() => null);
  const config = configRes?.data?.data;

  const nombre = config?.clinicName || CLINIC_INFO.name;
  const telefono = config?.clinicPhoneRaw || CLINIC_INFO.phoneRaw;
  const email = config?.clinicEmail || CLINIC_INFO.email;
  const direccion = extraerDireccion(
    config?.clinicAddress || CLINIC_INFO.address
  );
  const horarioSemana = extraerRangoHoras(
    config?.hoursWeekday || CLINIC_INFO.hours.weekday,
    { opens: "09:00", closes: "21:00" }
  );
  const horarioSabado = extraerRangoHoras(
    config?.hoursSaturday || CLINIC_INFO.hours.saturday,
    { opens: "10:00", closes: "20:00" }
  );
  const instagram = config?.socialInstagram || CLINIC_INFO.socials.instagram;
  const facebook = config?.socialFacebook || CLINIC_INFO.socials.facebook;
  const tiktok = config?.socialTikTok || CLINIC_INFO.socials.tiktok;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PhysicalTherapyClinic",
    name: nombre,
    url: "https://kinefitchile.com",
    logo: "https://kinefitchile.com/Kinefit Negro ver.png",
    telephone: telefono,
    email,
    address: {
      "@type": "PostalAddress",
      streetAddress: direccion.streetAddress,
      addressLocality: direccion.addressLocality,
      addressCountry: "CL",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: horarioSemana.opens,
        closes: horarioSemana.closes,
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: horarioSabado.opens,
        closes: horarioSabado.closes,
      },
    ],
    sameAs: [instagram, facebook, tiktok],
  };

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${jetbrainsMono.variable} h-full antialiased scroll-smooth`}
      style={
        {
          "--font-sans":
            'var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        } as React.CSSProperties
      }
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white font-sans">
        <ReactQueryProvider>
          <Navbar config={config} />
          <div className="flex-grow">{children}</div>
          <Footer />
          <WhatsAppButton />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
