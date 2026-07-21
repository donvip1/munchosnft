"use client";

import { CheckCircle2, LoaderCircle, ShieldCheck, Wallet, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useConnection, usePublicClient, useSwitchChain } from "wagmi";

import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusPill } from "@/components/ui/StatusPill";
import { useWalletConnection } from "@/components/web3/WalletConnectionProvider";
import {
  catalystFusionAbi,
  catalystFusionContractAddress,
  genesisAbi,
  genesisContractAddress,
  robinhoodTestnet
} from "@/config/web3";

type EligibilityResponse = {
  ok: boolean;
  eligible: boolean;
  count?: number;
  message?: string;
};

export function EligibilityChecker() {
  const connection = useConnection();
  const publicClient = usePublicClient({ chainId: robinhoodTestnet.id });
  const { openWalletModal, isConnecting } = useWalletConnection();
  const { mutateAsync: switchChain, isPending: isSwitching } = useSwitchChain();
  const [result, setResult] = useState<EligibilityResponse | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string>();
  const [participation, setParticipation] = useState({ minted: 0n, og: 0n, legendary: 0n });

  const wrongChain = connection.isConnected && connection.chainId !== robinhoodTestnet.id;

  useEffect(() => {
    if (!connection.address) {
      setResult(null);
      setError(undefined);
      return;
    }

    const controller = new AbortController();
    setChecking(true);
    setError(undefined);
    fetch(`/api/mint-proof?address=${connection.address}`, { signal: controller.signal })
      .then(async (response) => {
        const data = (await response.json()) as EligibilityResponse;
        if (!response.ok) throw new Error(data.message ?? "Eligibility lookup failed.");
        return data;
      })
      .then(setResult)
      .catch((lookupError: unknown) => {
        if (!(lookupError instanceof DOMException && lookupError.name === "AbortError")) {
          setError(lookupError instanceof Error ? lookupError.message : "Eligibility lookup failed.");
        }
      })
      .finally(() => setChecking(false));

    return () => controller.abort();
  }, [connection.address]);

  useEffect(() => {
    if (!connection.address || !publicClient) {
      setParticipation({ minted: 0n, og: 0n, legendary: 0n });
      return;
    }
    let active = true;
    void Promise.all([
      publicClient.readContract({ abi: genesisAbi, address: genesisContractAddress, functionName: "numberMinted", args: [connection.address] }),
      publicClient.readContract({ abi: catalystFusionAbi, address: catalystFusionContractAddress, functionName: "ogBalanceOf", args: [connection.address] }),
      publicClient.readContract({ abi: catalystFusionAbi, address: catalystFusionContractAddress, functionName: "legendaryBalanceOf", args: [connection.address] })
    ]).then(([minted, og, legendary]) => {
      if (active) setParticipation({ minted: minted as bigint, og: og as bigint, legendary: legendary as bigint });
    }).catch(() => undefined);
    return () => { active = false; };
  }, [connection.address, publicClient]);

  async function handleAction() {
    if (!connection.isConnected) {
      openWalletModal();
      return;
    }
    if (wrongChain) {
      await switchChain({ chainId: robinhoodTestnet.id });
    }
  }

  const status = checking
    ? "Checking eligibility"
    : result?.eligible
      ? "Eligible"
      : result
        ? "Not Eligible"
        : "Wallet Required";

  return (
    <div className="mx-auto w-full max-w-4xl">
      <SectionHeading eyebrow="Munchos Access" title="Eligibility and Testnet Progress">
        Testnet minting is open to all wallets. Existing whitelist and collab status remains separate from earned mainnet priority.
      </SectionHeading>

      <GlassCard className="mt-10 rounded-lg p-5 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <StatusPill tone={result?.eligible ? "green" : "white"}>
            <ShieldCheck aria-hidden="true" size={14} />
            {status}
          </StatusPill>
          {connection.address ? (
            <span className="font-mono text-xs text-white/45">
              {connection.address.slice(0, 6)}...{connection.address.slice(-4)}
            </span>
          ) : null}
        </div>

        <div className="mt-8 border-y border-white/10 py-8 text-center">
          {checking ? (
            <LoaderCircle aria-label="Checking eligibility" className="mx-auto animate-spin text-lemon" size={34} />
          ) : result?.eligible ? (
            <>
              <CheckCircle2 aria-hidden="true" className="mx-auto text-lemon" size={42} />
              <h2 className="mt-4 font-pixel text-2xl text-white">Mainnet whitelist eligible</h2>
              <p className="mt-2 text-sm text-white/58">This wallet is included in the existing whitelist and collaboration list.</p>
            </>
          ) : result ? (
            <>
              <XCircle aria-hidden="true" className="mx-auto text-white/45" size={42} />
              <h2 className="mt-4 font-pixel text-2xl text-white">Not currently whitelisted</h2>
              <p className="mt-2 text-sm text-white/58">You can still earn mainnet priority by holding a Testnet OG or Legendary at the snapshot.</p>
            </>
          ) : (
            <>
              <Wallet aria-hidden="true" className="mx-auto text-lemon" size={42} />
              <h2 className="mt-4 font-pixel text-2xl text-white">Wallet not connected</h2>
              <p className="mt-2 text-sm text-white/58">Connect an EVM wallet to check access.</p>
            </>
          )}
        </div>

        {connection.isConnected ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4"><p className="text-xs uppercase text-white/45">Testnet Participation</p><p className="mt-2 font-pixel text-white">{participation.legendary > 0n ? "Legendary Fused" : participation.og > 0n ? "OG Fused" : participation.minted > 0n ? "Genesis Minted" : "Not Started"}</p></div>
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4"><p className="text-xs uppercase text-white/45">Evolution Holdings</p><p className="mt-2 font-pixel text-white">{participation.og.toString()} OG · {participation.legendary.toString()} Legendary</p></div>
            <div className="rounded-lg border border-lemon/25 bg-lemon/[0.06] p-4"><p className="text-xs uppercase text-lemon">Mainnet Priority</p><p className="mt-2 font-pixel text-white">{result?.eligible || participation.og > 0n || participation.legendary > 0n ? "Unlocked" : "Not Yet Unlocked"}</p></div>
          </div>
        ) : null}

        <Button
          className="mt-6 w-full"
          disabled={isConnecting || isSwitching || checking}
          size="lg"
          type="button"
          onClick={handleAction}
        >
          {isConnecting || isSwitching || checking ? (
            <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
          ) : connection.isConnected && wrongChain ? (
            <ShieldCheck aria-hidden="true" size={18} />
          ) : connection.isConnected ? (
            <CheckCircle2 aria-hidden="true" size={18} />
          ) : (
            <Wallet aria-hidden="true" size={18} />
          )}
          {isConnecting
            ? "Connecting"
            : isSwitching
              ? "Switching Network"
              : checking
                ? "Checking"
                : wrongChain
                  ? "Switch to Robinhood Testnet"
                  : connection.isConnected
                    ? "Eligibility Checked"
                    : "Connect Wallet"}
        </Button>

        {error ? <p className="mt-4 text-center text-sm text-red-300">{error}</p> : null}
      </GlassCard>
    </div>
  );
}
