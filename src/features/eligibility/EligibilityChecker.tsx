"use client";

import { CheckCircle2, LoaderCircle, ShieldCheck, Wallet, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useConnection, useSwitchChain } from "wagmi";

import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusPill } from "@/components/ui/StatusPill";
import { useWalletConnection } from "@/components/web3/WalletConnectionProvider";
import { robinhoodTestnet } from "@/config/web3";

type EligibilityResponse = {
  ok: boolean;
  eligible: boolean;
  count?: number;
  message?: string;
};

export function EligibilityChecker() {
  const connection = useConnection();
  const { openWalletModal, isConnecting } = useWalletConnection();
  const { mutateAsync: switchChain, isPending: isSwitching } = useSwitchChain();
  const [result, setResult] = useState<EligibilityResponse | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string>();

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
    <div className="mx-auto w-full max-w-3xl">
      <SectionHeading eyebrow="Testnet Access" title="Check Testnet Eligibility">
        Connect a wallet to check the current Genesis whitelist. Minting is not available from this page.
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
              <h2 className="mt-4 font-pixel text-2xl text-white">Wallet eligible</h2>
              <p className="mt-2 text-sm text-white/58">Your address is included in the current testnet whitelist.</p>
            </>
          ) : result ? (
            <>
              <XCircle aria-hidden="true" className="mx-auto text-white/45" size={42} />
              <h2 className="mt-4 font-pixel text-2xl text-white">Not eligible</h2>
              <p className="mt-2 text-sm text-white/58">This wallet is not included in the current testnet whitelist.</p>
            </>
          ) : (
            <>
              <Wallet aria-hidden="true" className="mx-auto text-lemon" size={42} />
              <h2 className="mt-4 font-pixel text-2xl text-white">Wallet not connected</h2>
              <p className="mt-2 text-sm text-white/58">Connect an EVM wallet to check access.</p>
            </>
          )}
        </div>

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
