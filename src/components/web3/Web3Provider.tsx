"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";

import { WalletConnectionProvider } from "@/components/web3/WalletConnectionProvider";
import { web3Config } from "@/config/web3";

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={web3Config} reconnectOnMount>
      <QueryClientProvider client={queryClient}>
        <WalletConnectionProvider>{children}</WalletConnectionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
