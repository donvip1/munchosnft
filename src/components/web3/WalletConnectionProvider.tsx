"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, LoaderCircle, Wallet, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { createPortal } from "react-dom";
import { useConnect, useConnectors, type Connector } from "wagmi";

type InstalledWallet = {
  connector: Connector;
  name: string;
};

type WalletConnectionContextValue = {
  openWalletModal: () => void;
  isConnecting: boolean;
};

const WalletConnectionContext = createContext<WalletConnectionContextValue | null>(null);

const installOptions = [
  { name: "MetaMask", url: "https://metamask.io/download/" },
  { name: "Coinbase Wallet", url: "https://www.coinbase.com/wallet/downloads" },
  { name: "Trust Wallet", url: "https://trustwallet.com/browser-extension" }
] as const;

function connectorName(connector: Connector) {
  return connector.name === "Injected" ? "Browser Wallet" : connector.name;
}

export function WalletConnectionProvider({ children }: { children: ReactNode }) {
  const connectors = useConnectors();
  const { mutateAsync: connect, isPending, error, reset } = useConnect();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [installedWallets, setInstalledWallets] = useState<InstalledWallet[]>([]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    let active = true;
    setDetecting(true);
    reset();

    const discover = async () => {
      const providerSpecificFirst = [...connectors].sort(
        (a, b) => Number(Boolean(b.rdns)) - Number(Boolean(a.rdns))
      );
      const seenProviders = new Set<unknown>();
      const detected: InstalledWallet[] = [];

      for (const connector of providerSpecificFirst) {
        const provider = await connector.getProvider().catch(() => undefined);
        if (!provider || seenProviders.has(provider)) continue;

        seenProviders.add(provider);
        detected.push({ connector, name: connectorName(connector) });
      }

      if (active) {
        setInstalledWallets(detected);
        setDetecting(false);
      }
    };

    void discover();
    return () => {
      active = false;
    };
  }, [connectors, open, reset]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const openWalletModal = useCallback(() => setOpen(true), []);
  const value = useMemo(
    () => ({ openWalletModal, isConnecting: isPending }),
    [isPending, openWalletModal]
  );

  async function connectWallet(connector: Connector) {
    try {
      await connect({ connector });
      setOpen(false);
    } catch {
      // Wagmi exposes the actionable error in the modal.
    }
  }

  return (
    <WalletConnectionContext.Provider value={value}>
      {children}
      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  aria-label="Connect wallet"
                  aria-modal="true"
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-md"
                  role="dialog"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setOpen(false)}
                >
                  <motion.div
                    className="w-full max-w-md rounded-lg border border-white/12 bg-[#111111] p-5 shadow-glass"
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.98 }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase text-lemon">Wallet</p>
                        <h2 className="mt-1 font-pixel text-2xl text-white">Connect Wallet</h2>
                      </div>
                      <button
                        aria-label="Close wallet selector"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-white/70 transition hover:text-white"
                        title="Close"
                        type="button"
                        onClick={() => setOpen(false)}
                      >
                        <X aria-hidden="true" size={18} />
                      </button>
                    </div>

                    <div className="mt-5 space-y-2">
                      {detecting ? (
                        <div className="flex min-h-24 items-center justify-center gap-2 text-sm text-white/60">
                          <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
                          Detecting wallets
                        </div>
                      ) : installedWallets.length > 0 ? (
                        installedWallets.map(({ connector, name }) => (
                          <button
                            className="flex min-h-14 w-full items-center gap-3 rounded-lg border border-white/10 bg-white/[0.045] px-4 text-left transition hover:border-lemon/45 hover:bg-lemon/[0.07]"
                            disabled={isPending}
                            key={connector.uid}
                            type="button"
                            onClick={() => connectWallet(connector)}
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-lemon/25 bg-lemon/10 text-lemon">
                              {isPending ? (
                                <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
                              ) : (
                                <Wallet aria-hidden="true" size={18} />
                              )}
                            </span>
                            <span className="font-pixel text-base text-white">{name}</span>
                          </button>
                        ))
                      ) : (
                        <>
                          <p className="py-2 text-sm text-white/60">No browser wallet detected.</p>
                          {installOptions.map((option) => (
                            <a
                              className="flex min-h-12 w-full items-center justify-between rounded-lg border border-white/10 px-4 font-pixel text-sm text-white transition hover:border-lemon/45 hover:text-lemon"
                              href={option.url}
                              key={option.name}
                              rel="noreferrer"
                              target="_blank"
                            >
                              Install {option.name}
                              <ExternalLink aria-hidden="true" size={15} />
                            </a>
                          ))}
                        </>
                      )}
                    </div>

                    {error ? (
                      <p className="mt-4 break-words text-sm text-red-300">
                        {error.message.split("\n")[0]}
                      </p>
                    ) : null}
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}
    </WalletConnectionContext.Provider>
  );
}

export function useWalletConnection() {
  const context = useContext(WalletConnectionContext);
  if (!context) throw new Error("useWalletConnection must be used inside WalletConnectionProvider");
  return context;
}
