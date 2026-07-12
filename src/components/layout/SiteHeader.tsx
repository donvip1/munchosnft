import Image from "next/image";
import { ArrowDownToLine } from "lucide-react";

import { LinkButton } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { siteConfig } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/8 bg-ink/72 backdrop-blur-2xl">
      <nav
        className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <a className="flex items-center gap-3" href="#top" aria-label="Munchos NFT home">
          <span className="relative flex h-10 w-10 overflow-hidden rounded-2xl border border-lemon/35 bg-black/40 shadow-lemon">
            <Image
              src="/images/munchosnft.png"
              alt=""
              width={80}
              height={54}
              className="h-full w-full scale-[2.2] object-cover object-top"
              priority
            />
          </span>
          <span className="hidden font-pixel text-sm uppercase text-white sm:block">
            {siteConfig.name}
          </span>
        </a>

        <div className="hidden items-center gap-3 md:flex">
          <StatusPill tone="green">Robinhood Chain Native</StatusPill>
          <StatusPill tone="purple">V1 Waitlist</StatusPill>
        </div>

        <LinkButton href="#waitlist" size="sm">
          <ArrowDownToLine aria-hidden="true" size={15} />
          Join
        </LinkButton>
      </nav>
    </header>
  );
}
