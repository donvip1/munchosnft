import { SectionHeading } from "@/components/ui/SectionHeading";

export function FutureFeaturesSection() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <SectionHeading
          eyebrow="Future Modules"
          title="Built Like an App, Ready for the Chain"
        >
          Munchos NFT now has a live testnet eligibility check. Minting, fusion, evolution, rewards,
          and marketplace flows will open in announced stages.
        </SectionHeading>
      </div>
    </section>
  );
}
