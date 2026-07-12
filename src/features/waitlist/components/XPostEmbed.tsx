"use client";

import { useEffect } from "react";
import { ExternalLink, Twitter } from "lucide-react";

import { siteConfig } from "@/config/site";

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load: (element?: HTMLElement) => void;
      };
    };
  }
}

export function XPostEmbed() {
  useEffect(() => {
    if (!siteConfig.pinnedPostUrl) {
      return;
    }

    if (window.twttr?.widgets) {
      window.twttr.widgets.load();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.charset = "utf-8";
    document.body.appendChild(script);
  }, []);

  if (!siteConfig.pinnedPostUrl) {
    return (
      <a
        className="group flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-black/30 p-4 transition hover:border-lemon/40"
        href={siteConfig.xUrl}
        target="_blank"
        rel="noreferrer"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] text-lemon">
            <Twitter aria-hidden="true" size={18} />
          </span>
          <span>
            <span className="block font-pixel text-sm uppercase text-white">Pinned X Post</span>
            <span className="mt-1 block text-xs text-white/55">@{siteConfig.handle}</span>
          </span>
        </span>
        <ExternalLink
          className="text-white/36 transition group-hover:text-lemon"
          aria-hidden="true"
          size={18}
        />
      </a>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-2">
      <blockquote className="twitter-tweet" data-theme="dark" data-dnt="true">
        <a href={siteConfig.pinnedPostUrl}>Pinned post from Munchos NFT</a>
      </blockquote>
    </div>
  );
}
