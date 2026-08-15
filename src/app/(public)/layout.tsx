import "../globals.css";

import { Inter, JetBrains_Mono } from "next/font/google";

import Footer from "@/components/ui/Footer";
import Navbar from "@/components/ui/Navbar";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { CLINIC_INFO } from "@/lib/constants";
import { defaultMetadata } from "@/lib/metadata";

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PhysicalTherapyClinic",
    name: CLINIC_INFO.name,
    url: "https://kinefitchile.com",
    logo: "https://kinefitchile.com/Kinefit Negro ver.png",
    telephone: CLINIC_INFO.phoneRaw,
    email: CLINIC_INFO.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Pje. Maximiliano Poblete 596",
      addressLocality: "Antofagasta",
      addressCountry: "CL",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "21:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "10:00",
        closes: "20:00",
      },
    ],
    sameAs: [
      CLINIC_INFO.socials.instagram,
      CLINIC_INFO.socials.facebook,
      CLINIC_INFO.socials.tiktok,
    ],
  };

  return (
    <html
      lang="es"
      className={`${interSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white font-sans">
        <Navbar />
        <div className="flex-grow">{children}</div>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
