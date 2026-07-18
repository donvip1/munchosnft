"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FlaskConical,
  LoaderCircle,
  ShieldCheck,
  Wallet
} from "lucide-react";
import { useMemo, useState } from "react";
import { type Address, isAddressEqual } from "viem";
import {
  useConnection,
  usePublicClient,
  useSwitchChain,
  useWriteContract
} from "wagmi";

import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusPill } from "@/components/ui/StatusPill";
import { useWalletConnection } from "@/components/web3/WalletConnectionProvider";
import {
  fusedMetadataUrl,
  fusionAbi,
  fusionContractAddress,
  genesisAbi,
  genesisContractAddress,
  robinhoodTestnet
} from "@/config/web3";
import {
  getTransactionError,
  isFusionConfigured,
  validateFusionInputs
} from "@/features/fusion/fusion-state";

type Step = "idle" | "checking" | "approving" | "ready" | "fusing" | "complete";

export function FusionLab() {
  const connection = useConnection();
  const publicClient = usePublicClient({ chainId: robinhoodTestnet.id });
  const { openWalletModal, isConnecting } = useWalletConnection();
  const { mutateAsync: switchChain, isPending: isSwitching } = useSwitchChain();
  const { mutateAsync: writeContract } = useWriteContract();
  const [firstTokenId, setFirstTokenId] = useState("");
  const [secondTokenId, setSecondTokenId] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState<string>();
  const [transactionHash, setTransactionHash] = useState<Address>();

  const configured = isFusionConfigured(fusionContractAddress);
  const wrongChain = connection.isConnected && connection.chainId !== robinhoodTestnet.id;
  const busy = ["checking", "approving", "fusing"].includes(step);
  const explorerUrl = transactionHash
    ? `${robinhoodTestnet.blockExplorers.default.url}/tx/${transactionHash}`
    : undefined;
  const inputValidation = useMemo(
    () => validateFusionInputs(firstTokenId, secondTokenId),
    [firstTokenId, secondTokenId]
  );

  function resetSelection() {
    setApproved(false);
    setStep("idle");
    setError(undefined);
    setTransactionHash(undefined);
  }

  async function prepareFusion() {
    if (!connection.isConnected || !connection.address) {
      openWalletModal();
      return;
    }
    if (wrongChain) {
      await switchChain({ chainId: robinhoodTestnet.id });
      return;
    }
    if (!configured || !fusionContractAddress || !publicClient) {
      setError("The Testnet Fusion contract is not configured yet.");
      return;
    }
    if (!inputValidation.ok) {
      setError(inputValidation.message);
      return;
    }

    setStep("checking");
    setError(undefined);
    try {
      const [ownerA, ownerB, hasApproval] = await Promise.all([
        publicClient.readContract({
          abi: genesisAbi,
          address: genesisContractAddress,
          functionName: "ownerOf",
          args: [inputValidation.tokenIds[0]]
        }),
        publicClient.readContract({
          abi: genesisAbi,
          address: genesisContractAddress,
          functionName: "ownerOf",
          args: [inputValidation.tokenIds[1]]
        }),
        publicClient.readContract({
          abi: genesisAbi,
          address: genesisContractAddress,
          functionName: "isApprovedForAll",
          args: [connection.address, fusionContractAddress]
        })
      ]);

      if (!isAddressEqual(ownerA, connection.address) || !isAddressEqual(ownerB, connection.address)) {
        throw new Error("The connected wallet must own both selected Genesis NFTs.");
      }
      setApproved(hasApproval);
      setStep("ready");
    } catch (checkError) {
      setStep("idle");
      setError(getTransactionError(checkError, "Could not verify Genesis ownership."));
    }
  }

  async function approveFusion() {
    if (!fusionContractAddress || !publicClient) return;
    setStep("approving");
    setError(undefined);
    try {
      const hash = await writeContract({
        abi: genesisAbi,
        address: genesisContractAddress,
        functionName: "setApprovalForAll",
        args: [fusionContractAddress, true],
        chainId: robinhoodTestnet.id
      });
      setTransactionHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      setApproved(true);
      setStep("ready");
    } catch (approvalError) {
      setStep("ready");
      setError(getTransactionError(approvalError, "Fusion approval failed."));
    }
  }

  async function fuse() {
    if (!fusionContractAddress || !publicClient || !inputValidation.ok) return;
    setStep("fusing");
    setError(undefined);
    try {
      const hash = await writeContract({
        abi: fusionAbi,
        address: fusionContractAddress,
        functionName: "fuse",
        args: inputValidation.tokenIds,
        chainId: robinhoodTestnet.id
      });
      setTransactionHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      setStep("complete");
    } catch (fusionError) {
      setStep("ready");
      setError(getTransactionError(fusionError, "Fusion transaction failed."));
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <SectionHeading eyebrow="Robinhood Testnet" title="Fusion Lab">
        Combine two Genesis NFTs into one Fused Munchos testnet NFT.
      </SectionHeading>

      <GlassCard className="mt-10 rounded-lg p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusPill tone={configured ? "green" : "white"}>
            <FlaskConical aria-hidden="true" size={14} />
            {configured ? "Testnet Lab Ready" : "Deployment Pending"}
          </StatusPill>
          {connection.address ? (
            <span className="font-mono text-xs text-white/45">
              {connection.address.slice(0, 6)}...{connection.address.slice(-4)}
            </span>
          ) : null}
        </div>

        <div className="mt-6 flex gap-3 rounded-lg border border-amber-300/25 bg-amber-300/[0.07] p-4 text-sm text-amber-100">
          <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0" size={19} />
          <p>
            Fusion is permanent. Both selected Genesis NFTs are consumed, and one Fused
            Munchos testnet NFT is minted to your wallet in the same transaction.
          </p>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {[firstTokenId, secondTokenId].map((value, index) => (
            <label className="block" key={index === 0 ? "first" : "second"}>
              <span className="font-pixel text-sm text-white">
                Genesis #{index === 0 ? "1" : "2"}
              </span>
              <input
                className="mt-2 h-12 w-full rounded-lg border border-white/12 bg-black/30 px-4 font-mono text-white outline-none transition focus:border-lemon/60"
                disabled={busy || step === "complete"}
                inputMode="numeric"
                min="0"
                placeholder="Token ID"
                type="number"
                value={value}
                onChange={(event) => {
                  if (index === 0) setFirstTokenId(event.target.value);
                  else setSecondTokenId(event.target.value);
                  resetSelection();
                }}
              />
            </label>
          ))}
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs uppercase text-white/45">1. Verify</p>
            <p className="mt-2 font-pixel text-white">Ownership</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs uppercase text-white/45">2. Approve</p>
            <p className="mt-2 font-pixel text-white">Genesis Burn</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs uppercase text-white/45">3. Fuse</p>
            <p className="mt-2 font-pixel text-white">Receive Result</p>
          </div>
        </div>

        {step === "complete" ? (
          <div className="mt-7 border-y border-white/10 py-8 text-center">
            <CheckCircle2 aria-hidden="true" className="mx-auto text-lemon" size={42} />
            <h2 className="mt-4 font-pixel text-2xl text-white">Fusion complete</h2>
            <p className="mt-2 text-sm text-white/58">Your Fused Munchos is now in your wallet.</p>
            <a
              className="mt-4 inline-flex items-center gap-2 text-sm text-lemon hover:underline"
              href={fusedMetadataUrl}
              rel="noreferrer"
              target="_blank"
            >
              Preview fused asset <ExternalLink aria-hidden="true" size={15} />
            </a>
          </div>
        ) : null}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          {step === "approving" ? (
            <Button className="w-full" disabled size="lg" type="button">
              <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
              Confirming Approval
            </Button>
          ) : step === "fusing" ? (
            <Button className="w-full" disabled size="lg" type="button">
              <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
              Fusion in Progress
            </Button>
          ) : step !== "ready" && step !== "complete" ? (
            <Button
              className="w-full"
              disabled={busy || isConnecting || isSwitching || (!configured && connection.isConnected)}
              size="lg"
              type="button"
              onClick={prepareFusion}
            >
              {busy || isConnecting || isSwitching ? (
                <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
              ) : connection.isConnected ? (
                <ShieldCheck aria-hidden="true" size={18} />
              ) : (
                <Wallet aria-hidden="true" size={18} />
              )}
              {!connection.isConnected
                ? "Connect Wallet"
                : wrongChain
                  ? "Switch to Robinhood Testnet"
                  : step === "checking"
                    ? "Checking Ownership"
                    : "Verify Selected NFTs"}
            </Button>
          ) : step === "ready" && !approved ? (
            <Button className="w-full" disabled={busy} size="lg" type="button" onClick={approveFusion}>
              <ShieldCheck aria-hidden="true" size={18} />
              Approve Fusion
            </Button>
          ) : step === "ready" ? (
            <Button className="w-full" disabled={busy} size="lg" type="button" onClick={fuse}>
              <FlaskConical aria-hidden="true" size={18} />
              Fuse Genesis NFTs
            </Button>
          ) : null}
        </div>

        {explorerUrl ? (
          <a className="mt-4 inline-flex items-center gap-2 text-xs text-white/55 hover:text-lemon" href={explorerUrl} rel="noreferrer" target="_blank">
            View latest transaction <ExternalLink aria-hidden="true" size={14} />
          </a>
        ) : null}
        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      </GlassCard>
    </div>
  );
}
