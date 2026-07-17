"use client";

import Image from "next/image";
import Link from "next/link";

import { FutureModulesMenu } from "@/components/layout/FutureModulesMenu";
import { StatusPill } from "@/components/ui/StatusPill";
import { WalletButton } from "@/components/web3/WalletButton";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/8 bg-ink/72 backdrop-blur-2xl">
        <nav
          className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <Link className="flex items-center gap-3" href="/" aria-label="Munchos NFT home">
            <span className="relative flex h-12 w-32 items-center justify-center sm:w-40">
              <Image
                src="/images/munchosnft.png"
                alt=""
                width={220}
                height={147}
                className="h-full w-full object-contain drop-shadow-[0_0_14px_rgba(200,255,0,0.35)]"
                priority
              />
            </span>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <StatusPill tone="green">Robinhood Chain Native</StatusPill>
            <StatusPill tone="purple">V1 Whitelist</StatusPill>
          </div>

          <div className="flex items-center gap-2">
            <WalletButton />
            <FutureModulesMenu />
          </div>
        </nav>
    </header>
  );
}
