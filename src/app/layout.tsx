import { defaultMetadata } from "@/lib/metadata";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { CLINIC_INFO } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    "name": CLINIC_INFO.name,
    "url": "https://kinefitchile.com",
    "logo": "https://kinefitchile.com/Kinefit Negro ver.png",
    "telephone": CLINIC_INFO.phoneRaw,
    "email": CLINIC_INFO.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Pje. Maximiliano Poblete 596",
      "addressLocality": "Antofagasta",
      "addressCountry": "CL"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "21:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Saturday"],
        "opens": "10:00",
        "closes": "20:00"
      }
    ],
    "sameAs": [
      CLINIC_INFO.socials.instagram,
      CLINIC_INFO.socials.facebook,
      CLINIC_INFO.socials.tiktok
    ]
  };

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white">
        <Navbar />
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
