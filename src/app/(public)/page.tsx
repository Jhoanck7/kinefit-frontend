import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import GallerySection from "@/components/sections/GallerySection";
import ProcessSection from "@/components/sections/ProcessSection";
import TeamSection from "@/components/sections/TeamSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import LocationSection from "@/components/sections/LocationSection";
import { landingConfigService } from "@/lib/services/landingConfig.service";
import { specialistService } from "@/lib/services/specialist.service";


export default async function Home() {
  // SSR: Obtener toda la configuración de la Landing Page desde el servidor 
  // una sola vez antes de renderizar (evita múltiples peticiones desde el cliente)
  const config = await landingConfigService.getConfig();
  const specialists = await specialistService.getEspecialistas(undefined, true);

  return (
    <main>
      <HeroSection config={config} />
      <AboutSection config={config} />
      <TeamSection config={config} initialTeam={specialists} />
      <TestimonialsSection config={config} />
      <ProcessSection config={config} />
      <GallerySection config={config} />
      <LocationSection config={config} />
    </main>
  );
}
