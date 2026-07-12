import { Github, Twitter } from "lucide-react";

import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-white/56 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-pixel text-base text-white">{siteConfig.name}</p>
          <p className="mt-2 max-w-xl">
            A mobile-first Web3 community application built for the Robinhood Chain ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/70 transition hover:border-lemon/40 hover:text-lemon"
            href={siteConfig.xUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Munchos NFT on X"
          >
            <Twitter aria-hidden="true" size={18} />
          </a>
          <a
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/70 transition hover:border-violet/50 hover:text-violet-soft"
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <Github aria-hidden="true" size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
