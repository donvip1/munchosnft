import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useConnection, usePublicClient, useSwitchChain } from "wagmi";

import { EligibilityChecker } from "@/features/eligibility/EligibilityChecker";

const openWalletModal = vi.fn();

vi.mock("wagmi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("wagmi")>();
  return {
    ...actual,
    useConnection: vi.fn(),
    usePublicClient: vi.fn(),
    useSwitchChain: vi.fn()
  };
});

vi.mock("@/components/web3/WalletConnectionProvider", () => ({
  useWalletConnection: () => ({ openWalletModal, isConnecting: false })
}));

const mockedConnection = vi.mocked(useConnection);
const mockedPublicClient = vi.mocked(usePublicClient);
const mockedSwitchChain = vi.mocked(useSwitchChain);

describe("EligibilityChecker", () => {
  beforeEach(() => {
    mockedPublicClient.mockReturnValue(undefined);
    mockedSwitchChain.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false
    } as unknown as ReturnType<typeof useSwitchChain>);
  });

  it("opens the wallet selector without exposing mint controls", () => {
    mockedConnection.mockReturnValue({
      isConnected: false
    } as unknown as ReturnType<typeof useConnection>);

    render(createElement(EligibilityChecker));
    fireEvent.click(screen.getByRole("button", { name: "Connect Wallet" }));

    expect(openWalletModal).toHaveBeenCalledOnce();
    expect(screen.queryByText(/Mint Whitelist/i)).not.toBeInTheDocument();
  });

  it.each([
    [true, "Mainnet eligible"],
    [false, "Not currently whitelisted"]
  ])("renders the API eligibility result", async (eligible, expected) => {
    mockedConnection.mockReturnValue({
      isConnected: true,
      address: "0x1111111111111111111111111111111111111111",
      chainId: 46630
    } as unknown as ReturnType<typeof useConnection>);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, eligible, count: 3724 })
      })
    );

    render(createElement(EligibilityChecker));
    await waitFor(() => expect(screen.getByRole("heading", { name: expected })).toBeInTheDocument());
    expect(screen.queryByText(/Mint Whitelist/i)).not.toBeInTheDocument();
  });
});
