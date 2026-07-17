import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { FAQSection } from "@/features/home/FAQSection";
import { FutureFeaturesSection } from "@/features/home/FutureFeaturesSection";
import { HeroSection } from "@/features/home/HeroSection";
import { RoadmapSection } from "@/features/home/RoadmapSection";
import { WhitelistSection } from "@/features/home/WhitelistSection";
import { MintSection } from "@/features/mint/MintSection";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <MintSection />
        <WhitelistSection />
        <FutureFeaturesSection />
        <RoadmapSection />
        <FAQSection />
        <SiteFooter />
      </main>
    </>
  );
}
