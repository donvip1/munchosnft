import { SiteFooter } from "@/components/layout/SiteFooter";
import { FAQSection } from "@/features/home/FAQSection";
import { FutureFeaturesSection } from "@/features/home/FutureFeaturesSection";
import { HeroSection } from "@/features/home/HeroSection";
import { RoadmapSection } from "@/features/home/RoadmapSection";
import { WaitlistSection } from "@/features/home/WaitlistSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <WaitlistSection />
      <FutureFeaturesSection />
      <RoadmapSection />
      <FAQSection />
      <SiteFooter />
    </main>
  );
}
