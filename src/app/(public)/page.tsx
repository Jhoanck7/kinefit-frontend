import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import GallerySection from "@/components/sections/GallerySection";
import ProcessSection from "@/components/sections/ProcessSection";
import TeamSection from "@/components/sections/TeamSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import LocationSection from "@/components/sections/LocationSection";
import { sanityService } from "@/lib/services/sanity.service";


export default async function Home() {
  // Realizar consultas a Sanity CMS en paralelo desde el servidor
  const [sanityGallery, sanityTeam, sanityTestimonials] = await Promise.all([
    sanityService.getGallery(),
    sanityService.getTeam(),
    sanityService.getTestimonials(),
  ]);

  return (
    <main>
      <HeroSection />
      <AboutSection />
      <TeamSection initialTeam={sanityTeam} />
      <TestimonialsSection initialTestimonials={sanityTestimonials} />
      <ProcessSection />
      <GallerySection initialSlides={sanityGallery} />
      <LocationSection />
   
    </main>
  );
}
