import { EspecialistaResponse, LandingConfigResponse } from "@/models/responses";

import {
  AboutSection,
  GallerySection,
  HeroSection,
  LocationSection,
  ProcessSection,
  TeamSection,
  TestimonialsSection,
} from "./components";

interface HomeViewProps {
  config: LandingConfigResponse;
  specialists: EspecialistaResponse[];
}

export default function HomeView({ config, specialists }: HomeViewProps) {
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
