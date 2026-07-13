import { SectionHeading } from "@/components/ui/SectionHeading";

export function FutureFeaturesSection() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <SectionHeading
          eyebrow="Future Modules"
          title="Built Like an App, Ready for the Chain"
        >
          Munchos NFT is structured for wallet sessions, smart contracts, NFT state, rewards, and
          marketplace flows without replacing the waitlist foundation.
        </SectionHeading>
      </div>
    </section>
  );
}
