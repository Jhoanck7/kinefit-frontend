import { Suspense } from "react";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ServicesSection from "@/components/sections/ServicesSection";
import ContactSection from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <Suspense fallback={<div>Cargando...</div>}>
        <ServicesSection />
      </Suspense>
      <ContactSection />
    </main>
  );
}
