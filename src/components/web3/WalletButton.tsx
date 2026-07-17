"use client";

import { LogOut, Wallet } from "lucide-react";
import { useConnection, useDisconnect } from "wagmi";

import { Button } from "@/components/ui/Button";
import { useWalletConnection } from "@/components/web3/WalletConnectionProvider";

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletButton() {
  const connection = useConnection();
  const { mutate: disconnect } = useDisconnect();
  const { openWalletModal, isConnecting } = useWalletConnection();

  if (connection.isConnected && connection.address) {
    return (
      <Button
        aria-label={`Disconnect ${connection.address}`}
        className="h-9 px-2 text-[10px] sm:px-3 sm:text-xs"
        size="sm"
        title="Disconnect wallet"
        type="button"
        variant="secondary"
        onClick={() => disconnect()}
      >
        <LogOut aria-hidden="true" size={15} />
        {shortAddress(connection.address)}
      </Button>
    );
  }

  return (
    <Button
      className="h-9 px-2 text-[10px] sm:px-3 sm:text-xs"
      disabled={isConnecting}
      size="sm"
      type="button"
      onClick={openWalletModal}
    >
      <Wallet aria-hidden="true" size={15} />
      {isConnecting ? "Connecting" : "Connect Wallet"}
    </Button>
  );
}
