import AboutSection from "@/components/sections/AboutSection";
import GallerySection from "@/components/sections/GallerySection";
import HeroSection from "@/components/sections/HeroSection";
import LocationSection from "@/components/sections/LocationSection";
import ProcessSection from "@/components/sections/ProcessSection";
import TeamSection from "@/components/sections/TeamSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import { getLandingConfig } from "@/lib/panel/data/landing-config";
import { especialistaService } from "@/services";

export default async function Home() {
  // SSR: Obtener toda la configuración de la Landing Page desde el servidor
  // una sola vez antes de renderizar (evita múltiples peticiones desde el cliente)
  const config = await getLandingConfig();
  const especialistasRes = await especialistaService.getEspecialistas(
    undefined,
    true
  );
  const specialists = especialistasRes.data.data;

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
