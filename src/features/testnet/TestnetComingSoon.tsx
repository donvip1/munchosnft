import { Clock3 } from "lucide-react";

import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function TestnetComingSoon({ feature }: { feature: "Mint" | "Fusion" }) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center text-center">
      <Clock3 aria-hidden="true" className="text-lemon" size={44} />
      <div className="mt-6">
        <SectionHeading eyebrow="Testnet" title={`${feature} Coming Soon`}>
          This testnet phase is currently closed. Access will open after the official community announcement.
        </SectionHeading>
      </div>
      <LinkButton className="mt-8" href="/eligibility" size="lg">
        Check Mainnet Eligibility
      </LinkButton>
    </div>
  );
}
