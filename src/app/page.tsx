import { Suspense } from "react";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ServicesSection from "@/components/sections/ServicesSection";
import GallerySection from "@/components/sections/GallerySection";
import ProcessSection from "@/components/sections/ProcessSection";
import TeamSection from "@/components/sections/TeamSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import { sanityService } from "@/lib/services/sanity.service";

export default async function Home() {
  // Realizar consultas a Sanity CMS en paralelo desde el servidor
  const [sanityServices, sanityGallery, sanityTeam, sanityTestimonials] = await Promise.all([
    sanityService.getServices(),
    sanityService.getGallery(),
    sanityService.getTeam(),
    sanityService.getTestimonials(),
  ]);

  return (
    <main>
      <HeroSection />
      <AboutSection />
      <Suspense fallback={<div className="py-20 text-center text-slate-500">Cargando Especialidades...</div>}>
        <ServicesSection initialServices={sanityServices} />
      </Suspense>
      <TeamSection initialTeam={sanityTeam} />
      <TestimonialsSection initialTestimonials={sanityTestimonials} />
      <ProcessSection />
      <GallerySection initialSlides={sanityGallery} />
    </main>
  );
}
