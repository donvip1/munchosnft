"use client";

import { CheckCircle2, Copy, Share2, Trophy } from "lucide-react";
import { useState } from "react";

import { Button, LinkButton } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import type { WhitelistSuccess as WhitelistSuccessType } from "@/types/whitelist";

type WhitelistSuccessProps = {
  result: WhitelistSuccessType;
};

export function WhitelistSuccess({ result }: WhitelistSuccessProps) {
  const [copied, setCopied] = useState(false);
  const shareText = encodeURIComponent(
    `I joined the Munchos NFT whitelist, built for Robinhood Chain. Join with my referral link: ${result.referralLink}`
  );

  async function copyLink() {
    await navigator.clipboard.writeText(result.referralLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <GlassCard className="mx-auto max-w-2xl p-5 sm:p-7">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-lemon/35 bg-lemon/12 text-lemon shadow-lemon">
          <CheckCircle2 aria-hidden="true" size={24} />
        </div>
        <div>
          <p className="font-pixel text-2xl text-white">🎉 Welcome to Munchos NFT!</p>
          <p className="mt-2 text-sm leading-6 text-white/64">
            Your whitelist registration has been received successfully.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-black/28 p-4">
          <p className="font-pixel text-xs uppercase text-white/44">Referral Code</p>
          <p className="mt-2 break-all font-pixel text-xl text-lemon">{result.referralCode}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/28 p-4">
          <p className="font-pixel text-xs uppercase text-white/44">Total Referrals</p>
          <p className="mt-2 font-pixel text-xl text-white">{result.referralCount}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/28 p-4">
          <p className="font-pixel text-xs uppercase text-white/44">Whitelist Position</p>
          <p className="mt-2 font-pixel text-xl text-white/42">Coming Soon</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/28 p-4">
          <p className="font-pixel text-xs uppercase text-white/44">Reward Tier</p>
          <p className="mt-2 font-pixel text-xl text-white/42">Coming Soon</p>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-violet/24 bg-violet/10 p-4">
        <p className="font-pixel text-xs uppercase text-violet-soft">Referral Link</p>
        <p className="mt-2 break-all text-sm text-white/70">{result.referralLink}</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Button type="button" variant="secondary" onClick={copyLink}>
          <Copy aria-hidden="true" size={17} />
          {copied ? "Copied" : "Copy Link"}
        </Button>
        <LinkButton
          href={`https://x.com/intent/tweet?text=${shareText}`}
          target="_blank"
          rel="noreferrer"
        >
          <Share2 aria-hidden="true" size={17} />
          Share on X
        </LinkButton>
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-3xl border border-lemon/20 bg-lemon/[0.07] p-4 text-sm text-white/66">
        <Trophy aria-hidden="true" className="shrink-0 text-lemon" size={18} />
        <span>Referral rewards will unlock as the Robinhood Chain modules come online.</span>
      </div>
    </GlassCard>
  );
}
