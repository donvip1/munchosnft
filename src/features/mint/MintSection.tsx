"use client";

import { CheckCircle2, ExternalLink, LoaderCircle, RefreshCw, ShieldCheck, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatEther, type Hex } from "viem";
import {
  useConnection,
  useReadContract,
  useReadContracts,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract
} from "wagmi";

import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusPill } from "@/components/ui/StatusPill";
import { useWalletConnection } from "@/components/web3/WalletConnectionProvider";
import {
  genesisAbi,
  genesisContractAddress,
  robinhoodTestnet
} from "@/config/web3";

const phaseNames = ["Closed", "GTD", "Whitelist", "Public"] as const;

type ProofResponse = {
  ok: boolean;
  eligible: boolean;
  proof: Hex[];
  root: Hex;
  count: number;
};

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    const message = error.message.split("\n")[0];
    if (/user rejected|denied transaction/i.test(message)) return "Transaction cancelled.";
    if (/insufficient funds/i.test(message)) return "Insufficient ETH for the mint and gas.";
    return message.length > 150 ? `${message.slice(0, 147)}...` : message;
  }
  return "The transaction could not be completed.";
}

export function MintSection() {
  const connection = useConnection();
  const { openWalletModal, isConnecting } = useWalletConnection();
  const { mutateAsync: switchChain, isPending: isSwitching } = useSwitchChain();
  const { mutateAsync: writeContract, isPending: isWriting, error: writeError } = useWriteContract();
  const [proofData, setProofData] = useState<ProofResponse | null>(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [hash, setHash] = useState<Hex>();
  const [localError, setLocalError] = useState<string>();

  const baseContract = { address: genesisContractAddress, abi: genesisAbi } as const;
  const state = useReadContracts({
    contracts: [
      { ...baseContract, functionName: "salePhase" },
      { ...baseContract, functionName: "totalMinted" },
      { ...baseContract, functionName: "teamMinted" },
      { ...baseContract, functionName: "MAX_SUPPLY" },
      { ...baseContract, functionName: "TEAM_RESERVE" },
      { ...baseContract, functionName: "paused" },
      { ...baseContract, functionName: "whitelistMerkleRoot" },
      { ...baseContract, functionName: "GTD_PRICE" },
      { ...baseContract, functionName: "WHITELIST_PRICE" },
      { ...baseContract, functionName: "PUBLIC_PRICE" }
    ],
    allowFailure: false,
    query: { refetchInterval: 15_000 }
  });

  const phase = Number(state.data?.[0] ?? 0);
  const totalMinted = state.data?.[1] ?? 0n;
  const teamMinted = state.data?.[2] ?? 0n;
  const maxSupply = state.data?.[3] ?? 4444n;
  const teamReserve = state.data?.[4] ?? 100n;
  const paused = state.data?.[5] ?? false;
  const onchainWhitelistRoot = state.data?.[6];
  const prices = [0n, state.data?.[7] ?? 0n, state.data?.[8] ?? 0n, state.data?.[9] ?? 0n];
  const activePrice = prices[phase] ?? 0n;
  const publicSupplyLimit = maxSupply - (teamReserve - teamMinted);
  const remainingPublic = publicSupplyLimit > totalMinted ? publicSupplyLimit - totalMinted : 0n;

  const mintedInPhase = useReadContract({
    ...baseContract,
    functionName: "mintedInPhase",
    args: connection.address ? [connection.address, phase] : undefined,
    query: {
      enabled: Boolean(connection.address && phase > 0),
      refetchInterval: 15_000
    }
  });
  const refetchContractState = state.refetch;
  const refetchWalletMint = mintedInPhase.refetch;

  const receipt = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (!connection.address) {
      setProofData(null);
      return;
    }

    const controller = new AbortController();
    setProofLoading(true);
    fetch(`/api/mint-proof?address=${connection.address}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data: ProofResponse) => setProofData(data))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setLocalError("Whitelist proof lookup failed.");
        }
      })
      .finally(() => setProofLoading(false));

    return () => controller.abort();
  }, [connection.address]);

  useEffect(() => {
    if (receipt.isSuccess) {
      refetchContractState();
      refetchWalletMint();
    }
  }, [receipt.isSuccess, refetchContractState, refetchWalletMint]);

  const proofRootActive = useMemo(
    () =>
      Boolean(
        proofData?.root &&
          onchainWhitelistRoot &&
          proofData.root.toLowerCase() === onchainWhitelistRoot.toLowerCase()
      ),
    [onchainWhitelistRoot, proofData?.root]
  );

  const alreadyMinted = (mintedInPhase.data ?? 0n) > 0n;
  const wrongChain = connection.isConnected && connection.chainId !== robinhoodTestnet.id;
  const transactionPending = isWriting || receipt.isLoading;

  let actionLabel = "Mint Closed";
  if (!connection.isConnected) actionLabel = "Connect Wallet";
  else if (wrongChain) actionLabel = "Switch Network";
  else if (paused) actionLabel = "Mint Paused";
  else if (remainingPublic === 0n) actionLabel = "Sold Out";
  else if (alreadyMinted) actionLabel = "Already Minted";
  else if (phase === 1) actionLabel = "GTD Proof Required";
  else if (phase === 2 && proofLoading) actionLabel = "Checking Whitelist";
  else if (phase === 2 && !proofData?.eligible) actionLabel = "Not Eligible";
  else if (phase === 2 && !proofRootActive) actionLabel = "Whitelist Root Pending";
  else if (phase === 2) actionLabel = "Mint Whitelist";
  else if (phase === 3) actionLabel = "Mint Public";

  const canMint =
    connection.isConnected &&
    !wrongChain &&
    !paused &&
    !alreadyMinted &&
    remainingPublic > 0n &&
    ((phase === 2 && proofData?.eligible && proofRootActive) || phase === 3);

  async function handleAction() {
    setLocalError(undefined);
    setHash(undefined);

    try {
      if (!connection.isConnected) {
        openWalletModal();
        return;
      }
      if (wrongChain) {
        await switchChain({ chainId: robinhoodTestnet.id });
        return;
      }
      if (!canMint) return;

      const transactionHash = await writeContract({
        ...baseContract,
        chainId: robinhoodTestnet.id,
        functionName: phase === 2 ? "mintWhitelist" : "mintPublic",
        args: phase === 2 ? [proofData?.proof ?? []] : [],
        value: activePrice
      });
      setHash(transactionHash);
    } catch (error) {
      setLocalError(errorMessage(error));
    }
  }

  return (
    <section id="mint" className="border-y border-white/8 bg-black/20 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Testnet Mint" title="Munchos Genesis Mint">
          Live contract state on Robinhood Chain Testnet.
        </SectionHeading>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_22rem]">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-4">
            {[
              ["Phase", phaseNames[phase] ?? "Unknown"],
              ["Minted", `${totalMinted.toLocaleString()} / ${maxSupply.toLocaleString()}`],
              ["Available", remainingPublic.toLocaleString()],
              ["Price", activePrice > 0n ? `${formatEther(activePrice)} ETH` : "--"]
            ].map(([label, value]) => (
              <div className="min-h-24 bg-[#101010] p-4" key={label}>
                <p className="text-xs uppercase text-white/45">{label}</p>
                <p className="mt-3 break-words font-pixel text-lg text-white sm:text-xl">{value}</p>
              </div>
            ))}
          </div>

          <GlassCard className="rounded-lg p-5">
            <div className="flex items-center justify-between gap-3">
              <StatusPill tone={phase === 2 && proofData?.eligible ? "green" : "white"}>
                <ShieldCheck aria-hidden="true" size={13} />
                {connection.address
                  ? proofLoading
                    ? "Checking"
                    : proofData?.eligible
                      ? "Whitelisted"
                      : "Not Whitelisted"
                  : "Wallet Required"}
              </StatusPill>
              <button
                aria-label="Refresh contract state"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/60 transition hover:text-white"
                title="Refresh contract state"
                type="button"
                onClick={() => state.refetch()}
              >
                <RefreshCw aria-hidden="true" className={state.isFetching ? "animate-spin" : ""} size={16} />
              </button>
            </div>

            <Button
              className="mt-5 w-full"
              disabled={
                transactionPending ||
                isConnecting ||
                isSwitching ||
                (connection.isConnected && !wrongChain && !canMint)
              }
              size="lg"
              type="button"
              onClick={handleAction}
            >
              {transactionPending || isConnecting || isSwitching ? (
                <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
              ) : connection.isConnected ? (
                <CheckCircle2 aria-hidden="true" size={18} />
              ) : (
                <Wallet aria-hidden="true" size={18} />
              )}
              {transactionPending ? "Confirming" : actionLabel}
            </Button>

            {hash ? (
              <a
                className="mt-4 flex items-center justify-center gap-2 text-xs text-lemon hover:text-lemon-soft"
                href={`${robinhoodTestnet.blockExplorers.default.url}/tx/${hash}`}
                rel="noreferrer"
                target="_blank"
              >
                View transaction <ExternalLink aria-hidden="true" size={13} />
              </a>
            ) : null}
            {receipt.isSuccess ? (
              <p className="mt-3 text-center text-sm text-lemon">Mint confirmed.</p>
            ) : null}
            {localError || writeError ? (
              <p className="mt-3 break-words text-center text-sm text-red-300">
                {localError ?? errorMessage(writeError)}
              </p>
            ) : null}
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
