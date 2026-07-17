"use client";

import { LogOut, Wallet } from "lucide-react";
import { useConnect, useConnection, useDisconnect } from "wagmi";

import { Button } from "@/components/ui/Button";

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletButton() {
  const connection = useConnection();
  const { connectors, mutate: connect, isPending } = useConnect();
  const { mutate: disconnect } = useDisconnect();

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
      disabled={isPending || connectors.length === 0}
      size="sm"
      type="button"
      onClick={() => connectors[0] && connect({ connector: connectors[0] })}
    >
      <Wallet aria-hidden="true" size={15} />
      {isPending ? "Connecting" : "Connect Wallet"}
    </Button>
  );
}
