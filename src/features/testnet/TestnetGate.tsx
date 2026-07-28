"use client";

import { AlertTriangle, Clock3 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { GlassCard } from "@/components/ui/GlassCard";
import { testnetEndsAtMs } from "@/config/testnet";
import { getTestnetCountdown, hasTestnetEnded } from "@/features/testnet/testnet-status";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/London",
  timeZoneName: "short"
});

function useTestnetClock() {
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    setNowMs(Date.now());
    const timer = window.setInterval(() => setNowMs(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  return nowMs;
}

function EndedState() {
  return (
    <section className="mx-auto flex min-h-[56vh] w-full max-w-5xl items-center justify-center px-4 py-16 sm:px-6">
      <GlassCard className="w-full rounded-xl border-red-300/25 bg-red-300/[0.05] p-8 text-center sm:p-12">
        <AlertTriangle aria-hidden="true" className="mx-auto text-red-300" size={44} />
        <p className="mt-5 text-xs uppercase tracking-[0.24em] text-red-200/70">Campaign Closed</p>
        <h1 className="mt-3 font-pixel text-3xl text-white sm:text-5xl">Testnet has ended</h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
          The Munchos Robinhood Chain Testnet campaign is closed. New Genesis mints, fusion approvals, and NFT fusion are no longer available through this site.
        </p>
        <p className="mt-5 text-xs text-white/40">Closed {dateFormatter.format(testnetEndsAtMs)}</p>
      </GlassCard>
    </section>
  );
}

function CountdownBanner({ nowMs }: { nowMs: number }) {
  const countdown = getTestnetCountdown(nowMs, testnetEndsAtMs);
  const units = [
    ["Days", countdown.days],
    ["Hours", countdown.hours],
    ["Minutes", countdown.minutes],
    ["Seconds", countdown.seconds]
  ] as const;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 lg:px-8" aria-live="polite">
      <GlassCard className="rounded-xl border-amber-300/25 bg-amber-300/[0.05] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-amber-200">
              <Clock3 aria-hidden="true" size={18} />
              <p className="font-pixel text-sm uppercase">Testnet shutdown countdown</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Minting and fusion close at {dateFormatter.format(testnetEndsAtMs)}. Transactions started after the cutoff will be blocked by this site.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {units.map(([label, value]) => (
              <div className="min-w-16 rounded-lg border border-white/10 bg-black/25 px-2 py-3 text-center sm:min-w-20 sm:px-3" key={label}>
                <p className="font-pixel text-2xl tabular-nums text-white sm:text-3xl">{String(value).padStart(2, "0")}</p>
                <p className="mt-1 text-[10px] uppercase text-white/40 sm:text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </section>
  );
}

export function TestnetGate({ children }: { children: ReactNode }) {
  const nowMs = useTestnetClock();

  if (nowMs === null) {
    return <section className="mx-auto min-h-[56vh] w-full max-w-5xl px-4 py-16 sm:px-6" aria-hidden="true" />;
  }

  if (hasTestnetEnded(nowMs, testnetEndsAtMs)) {
    return <EndedState />;
  }

  return (
    <>
      <CountdownBanner nowMs={nowMs} />
      {children}
    </>
  );
}

export function TestnetCampaignCta({ active, ended }: { active: ReactNode; ended: ReactNode }) {
  const nowMs = useTestnetClock();
  if (nowMs === null) return null;
  return hasTestnetEnded(nowMs, testnetEndsAtMs) ? ended : active;
}
