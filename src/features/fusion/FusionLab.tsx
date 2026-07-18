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
import Image from "next/image";
import { useEffect, useState } from "react";
import { type Address, isAddressEqual } from "viem";
import { useConnection, usePublicClient, useSwitchChain, useWriteContract } from "wagmi";

import { Button, LinkButton } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusPill } from "@/components/ui/StatusPill";
import { useWalletConnection } from "@/components/web3/WalletConnectionProvider";
import {
  catalystFusionAbi,
  catalystFusionContractAddress,
  catalystMetadataBaseUrl,
  genesisAbi,
  genesisContractAddress,
  robinhoodTestnet
} from "@/config/web3";
import { getTransactionError, isFusionConfigured } from "@/features/fusion/fusion-state";

const genesisArt = [
  { id: 1, name: "Genesis 1", image: "/images/munchos/genesis-1.png" },
  { id: 2, name: "Genesis 2", image: "/images/munchos/genesis-2.jpg" },
  { id: 3, name: "Genesis 3", image: "/images/munchos/genesis-3.png" }
] as const;

const resultArt = {
  og: { name: "Munchos OG", image: "/images/munchos/munchos-og.png" },
  legendary: { name: "Munchos Legendary", image: "/images/munchos/munchos-legendary.png" }
} as const;

type Step = "idle" | "loading" | "ready" | "approving" | "fusing" | "complete";

export function FusionLab() {
  const connection = useConnection();
  const publicClient = usePublicClient({ chainId: robinhoodTestnet.id });
  const { openWalletModal, isConnecting } = useWalletConnection();
  const { mutateAsync: switchChain, isPending: isSwitching } = useSwitchChain();
  const { mutateAsync: writeContract } = useWriteContract();
  const [ownedTokens, setOwnedTokens] = useState<bigint[]>([]);
  const [selectedToken, setSelectedToken] = useState<bigint>();
  const [catalysts, setCatalysts] = useState<1 | 2>(1);
  const [step, setStep] = useState<Step>("idle");
  const [approved, setApproved] = useState(false);
  const [hash, setHash] = useState<Address>();
  const [resultId, setResultId] = useState<bigint>();
  const [error, setError] = useState<string>();

  const configured = isFusionConfigured(catalystFusionContractAddress);
  const wrongChain = connection.isConnected && connection.chainId !== robinhoodTestnet.id;
  const busy = ["loading", "approving", "fusing"].includes(step);
  const result = catalysts === 1 ? resultArt.og : resultArt.legendary;
  const selectedArt = selectedToken
    ? genesisArt[((Number(selectedToken) - 1) % genesisArt.length)]
    : undefined;
  const explorerUrl = hash ? `${robinhoodTestnet.blockExplorers.default.url}/tx/${hash}` : undefined;
  const resultUrl = resultId
    ? `${catalystMetadataBaseUrl}/${catalysts === 1 ? "og" : "legendary"}/${resultId}.json`
    : undefined;

  useEffect(() => {
    if (!connection.address || !publicClient) {
      setOwnedTokens([]);
      setSelectedToken(undefined);
      return;
    }
    let active = true;
    void publicClient
      .readContract({
        abi: genesisAbi,
        address: genesisContractAddress,
        functionName: "tokensOfOwner",
        args: [connection.address]
      })
      .then((tokens) => {
        if (active) {
          setOwnedTokens(tokens as bigint[]);
          setSelectedToken((current) => current ?? (tokens as bigint[])[0]);
        }
      })
      .catch(() => active && setOwnedTokens([]));
    return () => {
      active = false;
    };
  }, [connection.address, publicClient]);

  async function prepare() {
    if (!connection.address || !connection.isConnected) return openWalletModal();
    if (wrongChain) return switchChain({ chainId: robinhoodTestnet.id });
    if (!configured || !publicClient) return setError("Fusion is not configured yet.");
    if (!selectedToken) return setError("Connect a wallet that owns a Genesis NFT.");
    setStep("loading");
    setError(undefined);
    try {
      const exists = await publicClient.readContract({
        abi: genesisAbi,
        address: genesisContractAddress,
        functionName: "exists",
        args: [selectedToken]
      });
      if (!exists) {
        setOwnedTokens((tokens) => tokens.filter((token) => token !== selectedToken));
        setSelectedToken(undefined);
        throw new Error(
          "This Genesis no longer exists. It may already have been fused; refresh your wallet assets and select a live Genesis."
        );
      }
      const [owner, isApproved] = await Promise.all([
        publicClient.readContract({ abi: genesisAbi, address: genesisContractAddress, functionName: "ownerOf", args: [selectedToken] }),
        publicClient.readContract({ abi: genesisAbi, address: genesisContractAddress, functionName: "isApprovedForAll", args: [connection.address, catalystFusionContractAddress] })
      ]);
      if (!isAddressEqual(owner, connection.address)) throw new Error("This Genesis is not owned by the connected wallet.");
      setApproved(Boolean(isApproved));
      setStep("ready");
    } catch (cause) {
      setStep("idle");
      setError(getTransactionError(cause, "Could not verify Genesis ownership."));
    }
  }

  async function approve() {
    if (!publicClient) return;
    setStep("approving");
    try {
      const nextHash = await writeContract({ abi: genesisAbi, address: genesisContractAddress, functionName: "setApprovalForAll", args: [catalystFusionContractAddress, true], chainId: robinhoodTestnet.id });
      setHash(nextHash);
      await publicClient.waitForTransactionReceipt({ hash: nextHash });
      setApproved(true);
      setStep("ready");
    } catch (cause) {
      setStep("ready");
      setError(getTransactionError(cause, "Approval failed."));
    }
  }

  async function fuse() {
    if (!publicClient || !selectedToken) return;
    setStep("fusing");
    setError(undefined);
    try {
      const nextHash = await writeContract({ abi: catalystFusionAbi, address: catalystFusionContractAddress, functionName: "fuse", args: [selectedToken, catalysts], chainId: robinhoodTestnet.id });
      setHash(nextHash);
      await publicClient.waitForTransactionReceipt({ hash: nextHash });
      const minted = await publicClient.readContract({ abi: catalystFusionAbi, address: catalystFusionContractAddress, functionName: "totalMinted" });
      setResultId(minted as bigint);
      setOwnedTokens((tokens) => tokens.filter((token) => token !== selectedToken));
      setSelectedToken(undefined);
      setStep("complete");
    } catch (cause) {
      setStep("ready");
      setError(getTransactionError(cause, "Fusion failed."));
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <SectionHeading eyebrow="Robinhood Testnet" title="Catalyst Fusion Lab">
        Mint one Genesis, then choose the evolution path that fits your Munchos.
      </SectionHeading>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_24rem]">
        <GlassCard className="rounded-lg p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StatusPill tone={configured ? "green" : "white"}><FlaskConical aria-hidden="true" size={14} />{configured ? "Fusion Ready" : "Deployment Pending"}</StatusPill>
            {connection.address ? <span className="font-mono text-xs text-white/45">{connection.address.slice(0, 6)}...{connection.address.slice(-4)}</span> : null}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {genesisArt.map((art) => <div className="overflow-hidden rounded-lg border border-white/10 bg-black/20" key={art.id}><Image alt={art.name} className="aspect-square w-full object-cover" height={600} src={art.image} width={600} /><p className="p-3 font-pixel text-sm text-white">{art.name}</p></div>)}
          </div>

          <div className="mt-7 flex gap-3 rounded-lg border border-amber-300/25 bg-amber-300/[0.07] p-4 text-sm text-amber-100"><AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0" size={19} /><p>Fusion permanently burns the selected Genesis. One catalyst creates an OG; both catalysts create a Legendary.</p></div>

          <div className="mt-7">
            <p className="font-pixel text-sm text-white">Your Genesis NFTs</p>
            {connection.isConnected ? <div className="mt-3 flex flex-wrap gap-2">{ownedTokens.length ? ownedTokens.map((token) => <button className={`rounded-lg border px-4 py-3 font-mono text-sm ${selectedToken === token ? "border-lemon bg-lemon/10 text-lemon" : "border-white/10 text-white/70"}`} disabled={busy || step === "complete"} key={token.toString()} type="button" onClick={() => { setSelectedToken(token); setStep("idle"); setApproved(false); }}>{`#${token}`}</button>) : <p className="text-sm text-white/55">No live Genesis NFTs found in this wallet.</p>}</div> : <p className="mt-3 text-sm text-white/55">Connect a wallet to load owned Genesis NFTs.</p>}
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {([1, 2] as const).map((count) => <button className={`rounded-lg border p-4 text-left ${catalysts === count ? "border-lemon bg-lemon/[0.08]" : "border-white/10 bg-white/[0.03]"}`} disabled={busy || step === "complete"} key={count} type="button" onClick={() => { setCatalysts(count); setStep("idle"); setApproved(false); }}><p className="font-pixel text-white">{count === 1 ? "1 Catalyst · Munchos OG" : "2 Catalysts · Munchos Legendary"}</p><p className="mt-2 text-xs text-white/55">{count === 1 ? "A single evolution step." : "Spend the complete catalyst set."}</p></button>)}
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="overflow-hidden rounded-lg border border-white/10"><p className="border-b border-white/10 p-3 text-xs uppercase text-white/50">Selected Genesis</p>{selectedArt ? <><Image alt={selectedArt.name} className="aspect-square w-full object-cover" height={600} src={selectedArt.image} width={600} /><p className="p-3 font-pixel text-white">{selectedArt.name} #{selectedToken}</p></> : <div className="flex aspect-square items-center justify-center text-sm text-white/45">Select a token</div>}</div>
            <div className="overflow-hidden rounded-lg border border-lemon/25"><p className="border-b border-lemon/15 p-3 text-xs uppercase text-lemon">Result Preview</p><Image alt={result.name} className="aspect-square w-full object-cover" height={600} src={result.image} width={600} /><p className="p-3 font-pixel text-white">{result.name}</p></div>
          </div>

          {step === "complete" ? <div className="mt-7 border-y border-white/10 py-7 text-center"><CheckCircle2 aria-hidden="true" className="mx-auto text-lemon" size={40} /><h2 className="mt-3 font-pixel text-xl text-white">{result.name} minted</h2>{resultUrl ? <a className="mt-3 inline-flex items-center gap-2 text-sm text-lemon hover:underline" href={resultUrl} rel="noreferrer" target="_blank">View metadata <ExternalLink aria-hidden="true" size={14} /></a> : null}</div> : null}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">{step === "approving" ? <Button className="w-full" disabled size="lg"><LoaderCircle className="animate-spin" size={18} />Confirming Approval</Button> : step === "fusing" ? <Button className="w-full" disabled size="lg"><LoaderCircle className="animate-spin" size={18} />Fusing</Button> : step === "ready" && !approved ? <Button className="w-full" onClick={approve} size="lg"><ShieldCheck size={18} />Approve Fusion</Button> : step === "ready" ? <Button className="w-full" onClick={fuse} size="lg"><FlaskConical size={18} />Mint {result.name}</Button> : <Button className="w-full" disabled={isConnecting || isSwitching || busy} onClick={prepare} size="lg">{isConnecting || isSwitching ? <LoaderCircle className="animate-spin" size={18} /> : connection.isConnected ? <ShieldCheck size={18} /> : <Wallet size={18} />}{!connection.isConnected ? "Connect Wallet" : wrongChain ? "Switch to Robinhood Testnet" : "Verify Selected Genesis"}</Button>}</div>
          {explorerUrl ? <a className="mt-4 inline-flex items-center gap-2 text-xs text-white/55 hover:text-lemon" href={explorerUrl} rel="noreferrer" target="_blank">View transaction <ExternalLink size={14} /></a> : null}
          {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
        </GlassCard>

        <GlassCard className="h-fit rounded-lg p-5 sm:p-6"><p className="font-pixel text-lg text-white">Fusion Recipes</p><div className="mt-5 space-y-3"><div className="rounded-lg border border-lemon/25 bg-lemon/[0.06] p-4"><p className="font-pixel text-white">Genesis + 1 Catalyst</p><p className="mt-1 text-sm text-white/60">Munchos OG</p></div><div className="rounded-lg border border-amber-300/25 bg-amber-300/[0.06] p-4"><p className="font-pixel text-white">Genesis + 2 Catalysts</p><p className="mt-1 text-sm text-white/60">Munchos Legendary</p></div></div><div className="mt-6 grid grid-cols-2 gap-3"><Image alt="Munchos OG" className="aspect-square rounded-lg object-cover" height={400} src={resultArt.og.image} width={400} /><Image alt="Munchos Legendary" className="aspect-square rounded-lg object-cover" height={400} src={resultArt.legendary.image} width={400} /></div><p className="mt-5 text-xs leading-relaxed text-white/50">A catalyst is a virtual testnet choice attached to your Genesis. It is not a separate tradable NFT.</p><LinkButton className="mt-5 w-full" href="/eligibility" variant="ghost">Check Mainnet Status</LinkButton></GlassCard>
      </div>
    </div>
  );
}
